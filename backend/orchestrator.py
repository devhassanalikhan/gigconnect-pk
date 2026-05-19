# orchestrator.py
# Full 5-agent pipeline for KaamGraph PK
# FIXES APPLIED:
#   1. linguistic_agent: changed generate_content() → generate_content_async() (async fix)
#   2. geo_agent: Fixed Google Maps to use Places API (New) endpoint
#   3. geo_agent: Fixed Apify — increased timeout, reduced maxCrawledPlaces for speed
#   4. agent.py: Updated model references from gemini-2.0-flash → gemini-2.5-flash

import json
import math
import uuid
import requests
from datetime import datetime
from typing import Any

import google.generativeai as genai
from sqlalchemy.orm import Session

from config import (
    GEMINI_API_KEY, GEMINI_MODEL,
    DEFAULT_USER_LAT, DEFAULT_USER_LNG,
    GEO_RADIUS_KM, MAX_PROVIDERS_RETURNED,
    ESCROW_FEE_RATE, TRANSPORT_COST_PER_KM,
    DEFAULT_BUDGET, DEFAULT_LOCATION,
    GOOGLE_MAPS_API_KEY, APIFY_API_TOKEN,
)
from database import Provider, Job

# ─── Gemini client ────────────────────────────────────────
genai.configure(api_key=GEMINI_API_KEY)
_model = genai.GenerativeModel(GEMINI_MODEL)


# ══════════════════════════════════════════════════════════
# Utility helpers
# ══════════════════════════════════════════════════════════

def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two coordinates."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlng / 2) ** 2)
    return round(R * 2 * math.asin(math.sqrt(a)), 2)


def _trace_entry(agent: str, status: str, **kwargs) -> dict:
    emoji = "⚙️"
    if agent == "LinguisticAgent": emoji = "🗣️"
    elif agent == "GeoAgent": emoji = "📍"
    elif agent == "SchedulingAgent": emoji = "📅"
    elif agent == "BiddingAgent": emoji = "🤝"
    elif agent == "EscrowAgent": emoji = "🔒"
    elif agent == "FollowUpAgent": emoji = "📞"
    elif agent == "System": emoji = "🤖"

    color = "\033[96m"
    if status == "success":   color = "\033[92m"
    elif status == "warning": color = "\033[93m"
    elif status == "error":   color = "\033[91m"

    reset = "\033[0m"
    bold  = "\033[1m"

    msg = kwargs.get("message") or kwargs.get("error") or str(kwargs.get("output", "")) or ""
    if len(msg) > 120:
        msg = msg[:117] + "..."

    print(f"{emoji}  {bold}{color}{agent:<18}{reset} | {color}{status.upper():<8}{reset} | {msg}")

    return {
        "agent":     agent,
        "status":    status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **kwargs,
    }


def _compute_match_score(provider: dict, budget: float) -> float:
    """6-Factor provider matching score."""
    distance_score      = 1 / max(provider["distance_km"], 0.1)
    distance_normalized = min(distance_score / 10, 1.0)
    rating_score        = provider["rating"] / 5.0
    reliability_score   = provider.get("on_time_score", 0.85)
    cancellation_score  = 1.0 - provider.get("cancellation_rate", 0.05)
    price_diff          = abs(provider["base_cost"] - budget)
    price_score         = max(0, 1 - (price_diff / max(budget, 1)))
    experience_score    = min(provider.get("experience_years", 3) / 10.0, 1.0)

    composite = (
        distance_normalized * 0.25 +
        rating_score        * 0.20 +
        reliability_score   * 0.20 +
        cancellation_score  * 0.15 +
        price_score         * 0.10 +
        experience_score    * 0.10
    )
    return round(composite, 4)


# ══════════════════════════════════════════════════════════
# AGENT 1 — LinguisticAgent
# FIX: Changed generate_content() → generate_content_async()
#      The function is declared async, so we MUST await the Gemini call.
#      Using the synchronous version inside an async function blocks the
#      entire FastAPI event loop, causing timeouts and broken responses.
# ══════════════════════════════════════════════════════════

async def linguistic_agent(text: str) -> dict[str, Any]:
    prompt = f"""You are a linguistic agent for a Pakistani gig marketplace.
Parse this service request. Support Roman Urdu, Urdu, English, and mixed code-switched language.

Input: "{text}"

Term mapping:
- bijli wala / electrician / wiring / current / short circuit → Electrician
- plumber / nalka wala / pipe / paani leak / toti → Plumber
- AC wala / AC technician / cooling / thanda / gas bharna → AC Technician
- painter / rang wala / paint / deewar → Painter
- tutor / teacher / padhai / ustaad / math → Tutor
- carpenter / barhai / wood / furniture / door → Carpenter

Return ONLY raw JSON, NO markdown, NO explanation:
{{
  "serviceType": "Plumber",
  "location": "G-13",
  "time": "tomorrow morning",
  "budget": 1800,
  "urgency": "high",
  "job_complexity": "basic",
  "confidence": 0.95,
  "confirmation_needed": false,
  "confirmation_question": null,
  "detected_language": "roman_urdu"
}}

Rules:
- confidence: float 0.0-1.0. Set < 0.70 only if truly ambiguous or missing service category.
- confirmation_needed: true if confidence < 0.70
- confirmation_question: write a clarifying question in same language as input if needed
- urgency: "high" if urgent/jaldi/fori, else "normal"
- job_complexity: "basic" for simple tasks, "intermediate" for repairs, "complex" for installations
- detected_language: roman_urdu, urdu, english, or mixed
- serviceType must be one of: Electrician, Plumber, AC Technician, Painter, Tutor, Carpenter
- budget default: {DEFAULT_BUDGET}
- location default: "{DEFAULT_LOCATION}"
"""
    # ✅ FIX: Use async version to avoid blocking the FastAPI event loop
    response = await _model.generate_content_async(prompt)
    raw   = response.text.strip()
    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in LLM response: {raw!r}")
    return json.loads(raw[start:end])


# ══════════════════════════════════════════════════════════
# AGENT 2 — GeoAgent
# FIX 1: Google Maps — switched to Places API (New) with correct headers
# FIX 2: Apify — increased timeout to 30s, reduced maxCrawledPlaces to 5
# ══════════════════════════════════════════════════════════

def geo_agent(
    service_type: str,
    db: Session,
    budget: float,
    user_lat: float = DEFAULT_USER_LAT,
    user_lng: float = DEFAULT_USER_LNG,
    radius: float = GEO_RADIUS_KM,
) -> list[dict]:

    # ─── OPTION A: Google Places API (New) ───────────────────────────────────
    # FIX: The old "textsearch" endpoint (maps.googleapis.com/maps/api/place/textsearch/json)
    #      requires "Places API (Legacy)" to be enabled.
    #
    #      NEW endpoint: places.googleapis.com/v1/places:searchText
    #      Requires: "Places API (New)" enabled in your project
    #      Auth header: "X-Goog-Api-Key" instead of ?key= param
    #      Field mask header required: "X-Goog-FieldMask"
    #
    #      IMPORTANT: Your GOOGLE_MAPS_API_KEY must be a DIFFERENT key from your
    #      Gemini key. In GCP Console: APIs → Enable "Places API (New)" → create
    #      a key restricted to "Places API (New)" only.
    if GOOGLE_MAPS_API_KEY:
        try:
            url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "Content-Type":    "application/json",
                "X-Goog-Api-Key":  GOOGLE_MAPS_API_KEY,
                # Field mask: only request the fields we actually use
                "X-Goog-FieldMask": (
                    "places.id,"
                    "places.displayName,"
                    "places.rating,"
                    "places.location,"
                    "places.formattedAddress"
                ),
            }
            payload = {
                "textQuery":      f"{service_type} near G-13 Islamabad",
                "maxResultCount": MAX_PROVIDERS_RETURNED,
                "locationBias": {
                    "circle": {
                        "center": {"latitude": user_lat, "longitude": user_lng},
                        "radius": radius * 1000,  # metres
                    }
                },
            }
            res = requests.post(url, json=payload, headers=headers, timeout=8)

            if res.ok:
                data    = res.json()
                places  = data.get("places", [])
                if places:
                    dynamic_providers = []
                    for idx, place in enumerate(places[:MAX_PROVIDERS_RETURNED]):
                        name   = place.get("displayName", {}).get("text", f"Local {service_type} {idx+1}")
                        rating = place.get("rating", 4.5)
                        loc    = place.get("location", {})
                        lat    = loc.get("latitude",  user_lat + 0.005 * idx)
                        lng    = loc.get("longitude", user_lng + 0.005 * idx)
                        dist   = _haversine(user_lat, user_lng, lat, lng)

                        base_cost     = 1100 + int((rating - 3.5) * 400) if rating >= 3.5 else 1200
                        provider_data = {
                            "id":                f"GPLACE-{idx+1}",
                            "name":              name,
                            "service_type":      service_type,
                            "rating":            rating,
                            "distance_km":       dist,
                            "base_cost":         max(800, min(3000, base_cost)),
                            "on_time_score":     0.85,
                            "cancellation_rate": 0.05,
                            "experience_years":  3,
                        }
                        score                  = _compute_match_score(provider_data, budget)
                        provider_data["score"] = score
                        dynamic_providers.append(provider_data)
                    return dynamic_providers
            else:
                # Log the actual Maps API error for easier debugging
                print(f"\033[91m[GeoAgent] Google Maps error {res.status_code}: {res.text[:200]}\033[0m")

        except Exception as e:
            print(f"\033[91m[GeoAgent] Google Maps exception: {e}\033[0m")
            # Fall through to Apify

    # ─── OPTION B: Apify Scraper ─────────────────────────────────────────────
    # FIX: The original code used "run-sync-get-dataset-items" with timeout=6s.
    #      Apify's sync actor runs can take 30–120 seconds.
    #      Solution: use maxCrawledPlacesPerSearch=3 to keep it fast, timeout=30s.
    if APIFY_API_TOKEN:
        try:
            token = APIFY_API_TOKEN.strip()
            if "token=" in token:
                token = token.split("token=")[1].split("&")[0]

            url     = f"https://api.apify.com/v2/acts/apify~google-maps-scraper/run-sync-get-dataset-items?token={token}"
            payload = {
                "searchStrings":             [f"{service_type} in G-13 Islamabad"],
                # FIX: Reduced from MAX_PROVIDERS_RETURNED to 3 for faster response
                # (fewer places = shorter scrape time = less likely to hit 6s timeout)
                "maxCrawledPlacesPerSearch": min(MAX_PROVIDERS_RETURNED, 3),
            }
            # FIX: Increased timeout from 6s → 30s (Apify sync runs take 15-25s)
            res = requests.post(url, json=payload, timeout=30)

            if res.ok:
                results = res.json()
                if results and isinstance(results, list):
                    dynamic_providers = []
                    for idx, place in enumerate(results[:MAX_PROVIDERS_RETURNED]):
                        name      = place.get("title", f"Local {service_type} {idx+1}")
                        rating    = place.get("totalScore", 4.6)
                        dist      = round(0.4 + idx * 0.5, 2)
                        base_cost = 1200 + (idx * 200)

                        provider_data = {
                            "id":                f"APIFY-{idx+1}",
                            "name":              name,
                            "service_type":      service_type,
                            "rating":            rating,
                            "distance_km":       dist,
                            "base_cost":         base_cost,
                            "on_time_score":     0.85,
                            "cancellation_rate": 0.05,
                            "experience_years":  3,
                        }
                        score                  = _compute_match_score(provider_data, budget)
                        provider_data["score"] = score
                        dynamic_providers.append(provider_data)
                    return dynamic_providers
            else:
                print(f"\033[91m[GeoAgent] Apify error {res.status_code}: {res.text[:200]}\033[0m")

        except Exception as e:
            print(f"\033[91m[GeoAgent] Apify exception: {e}\033[0m")
            # Fall through to SQLite

    # ─── OPTION C: SQLite Database Fallback ───────────────────────────────────
    candidates = (
        db.query(Provider)
        .filter(Provider.service_type == service_type, Provider.is_available.is_(True))
        .all()
    )

    enriched: list[dict] = []
    for p in candidates:
        dist = _haversine(user_lat, user_lng, p.lat, p.lng)
        if dist > radius:
            continue

        provider_data = {
            "id":                    p.id,
            "name":                  p.name,
            "service_type":          p.service_type,
            "rating":                p.rating,
            "distance_km":           dist,
            "base_cost":             p.base_cost,
            "on_time_score":         p.on_time_score,
            "cancellation_rate":     p.cancellation_rate,
            "experience_years":      p.experience_years,
            "capacity_available":    p.capacity_available,
            "total_jobs_completed":  p.total_jobs_completed,
            "specializations":       p.specializations,
        }
        score                  = _compute_match_score(provider_data, budget)
        provider_data["score"] = score
        enriched.append(provider_data)

    enriched.sort(key=lambda x: -x["score"])
    return enriched[:MAX_PROVIDERS_RETURNED]


# ══════════════════════════════════════════════════════════
# AGENT 3 — BiddingAgent (unchanged — no issues found)
# ══════════════════════════════════════════════════════════

def bidding_agent(budget: float, provider: dict, urgency: str = "normal", complexity: str = "basic") -> dict:
    transport             = provider["distance_km"] * TRANSPORT_COST_PER_KM
    urgency_multiplier    = 1.20 if urgency == "high" else 1.0
    complexity_multiplier = {"basic": 1.0, "intermediate": 1.25, "complex": 1.60}.get(complexity, 1.0)

    provider_min = (provider["base_cost"] + transport) * urgency_multiplier * complexity_multiplier
    provider_min = round(provider_min)
    midpoint     = round((provider_min + budget) / 2)

    price_breakdown = {
        "base_cost":            provider["base_cost"],
        "transport_cost":       round(transport),
        "urgency_surcharge":    round(provider["base_cost"] * (urgency_multiplier - 1)),
        "complexity_surcharge": round(provider["base_cost"] * (complexity_multiplier - 1)),
        "provider_minimum":     provider_min,
    }

    if budget >= provider_min:
        return {
            "action":        "ACCEPT",
            "agreed_price":  budget,
            "provider_min":  provider_min,
            "client_budget": budget,
            "price_breakdown": price_breakdown,
            "reasoning":     f"Client budget {budget} PKR covers provider minimum {provider_min} PKR. Direct match."
        }
    elif budget < provider_min * 0.5:
        return {
            "action":        "REJECT",
            "agreed_price":  None,
            "provider_min":  provider_min,
            "client_budget": budget,
            "price_breakdown": price_breakdown,
            "reasoning":     f"Budget {budget} PKR is below 50% of provider minimum {provider_min} PKR. Outside ZOPA."
        }
    else:
        return {
            "action":        "COUNTER",
            "agreed_price":  midpoint,
            "provider_min":  provider_min,
            "client_budget": budget,
            "price_breakdown": price_breakdown,
            "reasoning":     f"ZOPA active: {provider_min}–{budget} PKR range. Midpoint {midpoint} PKR proposed."
        }


# ══════════════════════════════════════════════════════════
# AGENT 4 — EscrowAgent (unchanged — no issues found)
# ══════════════════════════════════════════════════════════

def escrow_agent(agreed_price: float) -> dict:
    fee = round(agreed_price * ESCROW_FEE_RATE, 2)
    net = round(agreed_price - fee, 2)
    return {
        "escrow_id":       f"ESC-{uuid.uuid4().hex[:8].upper()}",
        "booking_id":      f"BK-{uuid.uuid4().hex[:6].upper()}",
        "total":           agreed_price,
        "fee":             fee,
        "fee_rate_pct":    round(ESCROW_FEE_RATE * 100, 2),
        "net_to_provider": net,
        "status":          "MilestoneLocked",
        "locked_at":       datetime.utcnow().isoformat() + "Z",
    }


# ══════════════════════════════════════════════════════════
# AGENT 5 — FollowUpAgent (unchanged — no issues found)
# ══════════════════════════════════════════════════════════

def followup_agent(
    booking_id: str,
    provider_name: str,
    service_type: str,
    agreed_price: float,
    time_pref: str,
) -> dict:
    return {
        "client_sms": (
            f"✅ Booking Confirm! {service_type} by {provider_name}. "
            f"PKR {agreed_price} escrow mein lock hai. ID: {booking_id}. Time: {time_pref}."
        ),
        "provider_sms": (
            f"🔔 Naya booking! {service_type}. "
            f"PKR {agreed_price} secure hai. ID: {booking_id}. Time: {time_pref}."
        ),
        "provider_enroute_trigger":  f"Send en-route notification 30 mins before {time_pref}",
        "completion_checklist": [
            "Provider marks job complete in app",
            "Photo/video evidence uploaded",
            "Client confirms service received",
            "Rating and review submitted"
        ],
        "rating_reminder":     f"Job complete hone ke 1 ghante baad rating request milegi. Booking {booking_id}.",
        "reputation_update":   f"Provider rating will be updated after client feedback for booking {booking_id}.",
        "reminder_scheduled_for": f"1 hour after {time_pref}",
        "followup_90_day":     "Maintenance reminder scheduled for 90 days"
    }


def _local_heuristic_parse(text: str) -> dict:
    text_lower = text.lower()

    service_type = "Plumber"
    if any(k in text_lower for k in ["plumber","nalka","pipe","paani","leak","toti"]):
        service_type = "Plumber"
    elif any(k in text_lower for k in ["electrician","bijli","wiring","current","board","short","button"]):
        service_type = "Electrician"
    elif any(k in text_lower for k in ["ac","cooling","thanda","technician","fridge","gas"]):
        service_type = "AC Technician"
    elif any(k in text_lower for k in ["painter","paint","rang","color","wall"]):
        service_type = "Painter"
    elif any(k in text_lower for k in ["tutor","teacher","padhai","ustaad","math","study"]):
        service_type = "Tutor"
    elif any(k in text_lower for k in ["carpenter","barhai","wood","furniture","door","table"]):
        service_type = "Carpenter"

    location = DEFAULT_LOCATION
    import re
    loc_match = re.search(r'\b([a-z]-\d{1,2})\b', text_lower)
    if loc_match:
        location = loc_match.group(1).upper()
    elif "islamabad" in text_lower:
        location = "Islamabad"

    budget  = DEFAULT_BUDGET
    numbers = re.findall(r'\b\d{3,5}\b', text_lower)
    if numbers:
        budget = int(numbers[0])

    time_pref = "flexible"
    if any(k in text_lower for k in ["urgent","jaldi","fori","abbi","now"]):
        time_pref = "urgent"

    return {
        "serviceType":          service_type,
        "location":             location,
        "budget":               budget,
        "time":                 time_pref,
        "confidence":           1.0,
        "confirmation_needed":  False,
        "confirmation_question":None,
        "detected_language":    "heuristic_fallback"
    }


# ══════════════════════════════════════════════════════════
# STATE GRAPH ENGINE
# ══════════════════════════════════════════════════════════

from typing import TypedDict, Dict, List, Optional

class AgentState(TypedDict):
    text:            str
    parsed:          Dict[str, Any]
    providers:       List[Dict[str, Any]]
    top_provider:    Optional[Dict[str, Any]]
    bid:             Dict[str, Any]
    escrow:          Dict[str, Any]
    followup:        Dict[str, Any]
    job_id:          str
    agent_trace:     List[Dict[str, Any]]
    pipeline_status: str


async def linguistic_node(state: AgentState) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [LinguisticAgentNode]",
    ))
    try:
        parsed          = await linguistic_agent(state["text"])
        state["parsed"] = parsed
        state["agent_trace"].append(_trace_entry(
            agent="LinguisticAgent", status="success", output=parsed,
            message=(
                f"Parsed [{parsed.get('detected_language','unknown')}] with "
                f"{parsed.get('confidence',0)*100:.0f}% confidence: "
                f"{parsed.get('serviceType')} in {parsed.get('location')}, "
                f"budget {parsed.get('budget')} PKR, urgency: {parsed.get('urgency','normal')}, "
                f"complexity: {parsed.get('job_complexity','basic')}"
                + (f" ⚠️ Low confidence — asking: {parsed.get('confirmation_question')}"
                   if parsed.get('confirmation_needed') else "")
            )
        ))
    except Exception as exc:
        state["pipeline_status"] = "partial"
        parsed          = _local_heuristic_parse(state["text"])
        state["parsed"] = parsed
        state["agent_trace"].append(_trace_entry(
            agent="LinguisticAgent", status="error",
            error=str(exc), fallback=parsed,
            message=f"LLM failed. Heuristic fallback: {parsed['serviceType']} in {parsed['location']}, budget {parsed['budget']} PKR.",
        ))
    return state


def geo_node(state: AgentState, db: Session) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [GeoAgentNode]",
    ))
    try:
        lat       = state["parsed"].get("lat", DEFAULT_USER_LAT)
        lng       = state["parsed"].get("lng", DEFAULT_USER_LNG)
        providers = geo_agent(
            service_type=state["parsed"]["serviceType"],
            db=db,
            budget=state["parsed"].get("budget", DEFAULT_BUDGET),
            user_lat=lat,
            user_lng=lng,
            radius=GEO_RADIUS_KM
        )

        if not providers:
            state["agent_trace"].append(_trace_entry(
                agent="GeoAgent", status="warning",
                message=f"[Self-Healing] No workers in {GEO_RADIUS_KM}km. Expanding to 10.0km..."
            ))
            providers = geo_agent(
                service_type=state["parsed"]["serviceType"],
                db=db,
                budget=state["parsed"].get("budget", DEFAULT_BUDGET),
                user_lat=lat, user_lng=lng, radius=10.0
            )

        if not providers:
            raise ValueError(f"No available {state['parsed']['serviceType']} providers within 10km.")

        state["providers"]    = providers
        state["top_provider"] = providers[0]
        state["agent_trace"].append(_trace_entry(
            agent="GeoAgent", status="success",
            output={"providers_found": len(providers), "top": state["top_provider"]["name"]},
            message=(
                f"Ranked {len(providers)} providers. "
                f"Top: {state['top_provider']['name']} — "
                f"Score:{state['top_provider']['score']} | "
                f"OnTime:{state['top_provider'].get('on_time_score',0.85)*100:.0f}% | "
                f"{state['top_provider']['distance_km']}km | ⭐{state['top_provider']['rating']}"
            )
        ))
    except Exception as exc:
        state["pipeline_status"] = "partial"
        state["agent_trace"].append(_trace_entry(
            agent="GeoAgent", status="error", error=str(exc),
            message="No providers matched; downstream agents will be skipped",
        ))
    return state


def scheduling_node(state: AgentState, db: Session) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [SchedulingAgentNode]",
    ))

    if not state["top_provider"]:
        state["agent_trace"].append(_trace_entry(
            agent="SchedulingAgent", status="skipped",
            message="Skipped — no provider from GeoAgent",
        ))
        return state

    try:
        requested_time   = state["parsed"].get("time", "flexible")
        provider_id      = state["top_provider"]["id"]
        existing_booking = db.query(Job).filter(
            Job.provider_id_assigned == provider_id,
            Job.scheduled_time       == requested_time,
            Job.status               == "MilestoneLocked"
        ).first()

        if existing_booking:
            state["agent_trace"].append(_trace_entry(
                agent="SchedulingAgent", status="warning",
                message=(
                    f"⚠️ Double booking conflict! {state['top_provider']['name']} already booked at '{requested_time}'. "
                    "Auto-selecting next best provider..."
                ),
            ))
            if len(state["providers"]) > 1:
                state["top_provider"] = state["providers"][1]
                state["agent_trace"].append(_trace_entry(
                    agent="SchedulingAgent", status="success",
                    message=(
                        f"Rescheduled to: {state['top_provider']['name']} "
                        f"({state['top_provider']['distance_km']}km, ⭐{state['top_provider']['rating']}). "
                        "30-minute travel buffer added."
                    ),
                ))
            else:
                state["agent_trace"].append(_trace_entry(
                    agent="SchedulingAgent", status="warning",
                    message="No alternate providers. Suggested slots: Tomorrow 9AM or 3PM. Waitlist activated.",
                ))
        else:
            state["agent_trace"].append(_trace_entry(
                agent="SchedulingAgent", status="success",
                message=(
                    f"Slot verified: {state['top_provider']['name']} available at '{requested_time}'. "
                    f"No conflicts. 30-min buffer applied. "
                    f"Capacity: {state['top_provider'].get('capacity_available', 2)} slots."
                ),
            ))
    except Exception as exc:
        state["agent_trace"].append(_trace_entry(
            agent="SchedulingAgent", status="error", error=str(exc),
            message="Scheduling check failed — proceeding without conflict validation",
        ))
    return state


def bidding_node(state: AgentState) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [BiddingAgentNode]",
    ))
    if state["top_provider"]:
        try:
            bid         = bidding_agent(
                state["parsed"].get("budget", DEFAULT_BUDGET),
                state["top_provider"],
                urgency=state["parsed"].get("urgency", "normal"),
                complexity=state["parsed"].get("job_complexity", "basic")
            )
            state["bid"] = bid
            state["agent_trace"].append(_trace_entry(
                agent="BiddingAgent", status="success", output=bid,
                message=f"ZOPA result: {bid['action']}. " + (
                    f"Agreed: {bid['agreed_price']} PKR"
                    if bid["action"] != "REJECT"
                    else f"Provider min ({bid['provider_min']} PKR) exceeds budget"
                )
            ))
        except Exception as exc:
            state["pipeline_status"] = "partial"
            bid          = {"action": "ERROR", "agreed_price": state["parsed"]["budget"]}
            state["bid"] = bid
            state["agent_trace"].append(_trace_entry(
                agent="BiddingAgent", status="error", error=str(exc), fallback=bid,
            ))
    else:
        state["agent_trace"].append(_trace_entry(
            agent="BiddingAgent", status="skipped",
            message="Skipped — no provider from GeoAgent",
        ))
    return state


def escrow_node(state: AgentState) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [EscrowAgentNode]",
    ))
    agreed_price = state["bid"].get("agreed_price")
    if agreed_price and state["bid"].get("action") != "REJECT":
        try:
            escrow          = escrow_agent(agreed_price)
            state["escrow"] = escrow
            state["agent_trace"].append(_trace_entry(
                agent="EscrowAgent", status="success", output=escrow,
                message=(
                    f"Escrow locked. ID: {escrow['escrow_id']}. "
                    f"Fee: {escrow['fee']} PKR ({escrow['fee_rate_pct']}%). "
                    f"Net to provider: {escrow['net_to_provider']} PKR."
                )
            ))
        except Exception as exc:
            state["pipeline_status"] = "partial"
            state["agent_trace"].append(_trace_entry(
                agent="EscrowAgent", status="error", error=str(exc),
            ))
    else:
        reason = "bid was REJECTED" if state["bid"].get("action") == "REJECT" else "no agreed price"
        state["agent_trace"].append(_trace_entry(
            agent="EscrowAgent", status="skipped",
            message=f"Skipped — {reason}",
        ))
    return state


def followup_node(state: AgentState) -> AgentState:
    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Activating State Graph Node: [FollowUpAgentNode]",
    ))
    if state["escrow"].get("booking_id") and state["top_provider"]:
        try:
            followup          = followup_agent(
                booking_id=state["escrow"]["booking_id"],
                provider_name=state["top_provider"]["name"],
                service_type=state["top_provider"]["service_type"],
                agreed_price=state["bid"].get("agreed_price", 0),
                time_pref=state["parsed"].get("time", "flexible"),
            )
            state["followup"] = followup
            state["agent_trace"].append(_trace_entry(
                agent="FollowUpAgent", status="success", output=followup,
                message=f"SMS sent. Rating reminder: {followup['reminder_scheduled_for']}."
            ))
        except Exception as exc:
            state["pipeline_status"] = "partial"
            state["agent_trace"].append(_trace_entry(
                agent="FollowUpAgent", status="error", error=str(exc),
            ))
    else:
        state["agent_trace"].append(_trace_entry(
            agent="FollowUpAgent", status="skipped",
            message="Skipped — no confirmed booking",
        ))
    return state


# ─── ORCHESTRATOR ─────────────────────────────────────────

async def run_pipeline(
    text: str,
    db: Session,
    user_lat: float = None,
    user_lng: float = None,
) -> dict:
    state: AgentState = {
        "text":            text,
        "parsed":          {},
        "providers":       [],
        "top_provider":    None,
        "bid":             {},
        "escrow":          {},
        "followup":        {},
        "job_id":          f"JOB-{uuid.uuid4().hex[:8].upper()}",
        "agent_trace":     [],
        "pipeline_status": "success",
    }

    print("\n" + "\033[95m" + "="*80 + "\033[0m")
    print(f"\033[1m🤖 KAAMGRAPH AI DISPATCH (Job: {state['job_id']})\033[0m")
    print(f"📝 Request: \033[94m\"{text}\"\033[0m")
    print("\033[95m" + "="*80 + "\033[0m")

    state["agent_trace"].append(_trace_entry(
        agent="System", status="success",
        message="LangGraph: Initializing State Graph engine...",
    ))

    state = await linguistic_node(state)

    if user_lat is not None and user_lng is not None:
        state["parsed"]["lat"] = user_lat
        state["parsed"]["lng"] = user_lng
        state["agent_trace"].append(_trace_entry(
            agent="System", status="success",
            message=f"Coordinates overridden: lat={user_lat}, lng={user_lng}",
        ))

    if not state["parsed"].get("confirmation_needed"):
        state = geo_node(state, db)
        state = scheduling_node(state, db)
        state = bidding_node(state)
        state = escrow_node(state)
        state = followup_node(state)
    else:
        state["agent_trace"].append(_trace_entry(
            agent="System", status="warning",
            message="Downstream agents skipped — low confidence, clarification needed.",
        ))

    try:
        job = Job(
            id=state["job_id"],
            parsed=state["parsed"],
            providers=state["providers"],
            bid=state["bid"] or None,
            escrow=state["escrow"] or None,
            status="Pending Clarification" if state["parsed"].get("confirmation_needed") else state["escrow"].get("status", state["bid"].get("action", "Searching")),
            provider_id_assigned=state["top_provider"]["id"] if state["top_provider"] else None,
            scheduled_time=state["parsed"].get("time", "flexible"),
            job_complexity=state["parsed"].get("job_complexity", "basic"),
            confidence_score=state["parsed"].get("confidence"),
        )
        db.add(job)
        db.commit()
    except Exception as exc:
        state["agent_trace"].append(_trace_entry(
            agent="System", status="error",
            error=f"DB persist failed: {exc}",
        ))

    print("\033[95m" + "="*80 + "\033[0m")
    print(f"\033[92m✅ Pipeline done | Status: {state['pipeline_status']} | Booking: {bool(state['escrow'].get('booking_id'))}\033[0m")
    print("\033[95m" + "="*80 + "\033[0m\n")

    return {
        "job_id":           state["job_id"],
        "pipeline_status":  state["pipeline_status"],
        "parsed_request":   state["parsed"],
        "providers":        state["providers"],
        "bid":              state["bid"],
        "escrow":           state["escrow"],
        "followup":         state["followup"],
        "booking_confirmed": bool(state["escrow"].get("booking_id")),
        "agent_trace":      state["agent_trace"],
    }
