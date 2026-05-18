# orchestrator.py
# Full 5-agent pipeline for GigConnect PK
# Agents run sequentially: 1→2→3→4→5
# Each agent logs to agent_trace. Failures are caught and logged; pipeline continues.
# All output is JSON-serializable.

import json
import math
import uuid
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
    return {
        "agent": agent,
        "status": status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **kwargs,
    }


# ══════════════════════════════════════════════════════════
# AGENT 1 — LinguisticAgent
# Parses Roman Urdu / Urdu / English via Gemini 2.5 Flash.
# Extracts: serviceType, location, time, budget.
# ══════════════════════════════════════════════════════════

async def linguistic_agent(text: str) -> dict[str, Any]:
    prompt = f"""You are a linguistic agent for a Pakistani gig marketplace.
Parse this service request. Support Roman Urdu, Urdu, and English.

Input: "{text}"

Term mapping:
- bijli wala / electrician / wiring / current → Electrician
- plumber / nalka wala / pipe / paani leak → Plumber
- AC wala / AC technician / cooling / thanda → AC Technician
- painter / rang wala / paint → Painter
- tutor / teacher / padhai / ustaad → Tutor
- carpenter / barhai / wood / furniture → Carpenter

Return ONLY a raw JSON object with NO markdown, NO explanation:
{{"serviceType": "Plumber", "location": "G-13", "time": "urgent", "budget": 1800}}

Rules:
- If budget not mentioned, use {DEFAULT_BUDGET}.
- If location not mentioned, use "{DEFAULT_LOCATION}".
- If time not mentioned, use "flexible".
- serviceType must exactly match one of: Electrician, Plumber, AC Technician, Painter, Tutor, Carpenter.
"""
    response = _model.generate_content(prompt)
    raw = response.text.strip()
    # Strip any markdown fences or surrounding text
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in LLM response: {raw!r}")
    return json.loads(raw[start:end])


# ══════════════════════════════════════════════════════════
# AGENT 2 — GeoAgent
# Queries SQLite providers within GEO_RADIUS_KM.
# Ranking score = (1/distance × 0.5) + (rating/5 × 0.5)
# (higher is better; inverted distance so closer = higher score)
# ══════════════════════════════════════════════════════════

def geo_agent(
    service_type: str,
    db: Session,
    user_lat: float = DEFAULT_USER_LAT,
    user_lng: float = DEFAULT_USER_LNG,
) -> list[dict]:
    candidates = (
        db.query(Provider)
        .filter(Provider.service_type == service_type, Provider.is_available.is_(True))
        .all()
    )

    enriched: list[dict] = []
    for p in candidates:
        dist = _haversine(user_lat, user_lng, p.lat, p.lng)
        if dist > GEO_RADIUS_KM:
            continue  # outside radius
        score = round((1 / max(dist, 0.1)) * 0.5 + (p.rating / 5) * 0.5, 4)
        enriched.append({
            "id": p.id,
            "name": p.name,
            "service_type": p.service_type,
            "rating": p.rating,
            "distance_km": dist,
            "base_cost": p.base_cost,
            "score": score,
        })

    enriched.sort(key=lambda x: -x["score"])
    return enriched[:MAX_PROVIDERS_RETURNED]


# ══════════════════════════════════════════════════════════
# AGENT 3 — BiddingAgent
# ZOPA reverse-bid logic:
#   providerMin = base_cost + (distance × transport_rate)
#   If clientBudget >= providerMin → ACCEPT at clientBudget
#   Else → COUNTER at midpoint(providerMin, clientBudget)
#   If clientBudget < providerMin * 0.5 → REJECT
# ══════════════════════════════════════════════════════════

def bidding_agent(
    budget: float,
    provider: dict,
) -> dict:
    transport = provider["distance_km"] * TRANSPORT_COST_PER_KM
    provider_min = provider["base_cost"] + transport
    midpoint = round((provider_min + budget) / 2)

    if budget >= provider_min:
        return {
            "action": "ACCEPT",
            "agreed_price": budget,
            "provider_min": round(provider_min),
            "client_budget": budget,
        }
    elif budget < provider_min * 0.5:
        return {
            "action": "REJECT",
            "agreed_price": None,
            "provider_min": round(provider_min),
            "client_budget": budget,
            "reason": "Budget too far below minimum",
        }
    else:
        return {
            "action": "COUNTER",
            "agreed_price": midpoint,
            "provider_min": round(provider_min),
            "client_budget": budget,
        }


# ══════════════════════════════════════════════════════════
# AGENT 4 — EscrowAgent
# Fee = agreed_price × 9.99%
# Creates escrow record with status=MilestoneLocked
# ══════════════════════════════════════════════════════════

def escrow_agent(agreed_price: float) -> dict:
    fee = round(agreed_price * ESCROW_FEE_RATE, 2)
    net = round(agreed_price - fee, 2)
    return {
        "escrow_id": f"ESC-{uuid.uuid4().hex[:8].upper()}",
        "booking_id": f"BK-{uuid.uuid4().hex[:6].upper()}",
        "total": agreed_price,
        "fee": fee,
        "fee_rate_pct": round(ESCROW_FEE_RATE * 100, 2),
        "net_to_provider": net,
        "status": "MilestoneLocked",
        "locked_at": datetime.utcnow().isoformat() + "Z",
    }


# ══════════════════════════════════════════════════════════
# AGENT 5 — FollowUpAgent
# Generates SMS confirmation text for client + provider.
# Schedules a rating reminder.
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
            f"✅ Booking Confirm! {service_type} service by {provider_name}. "
            f"PKR {agreed_price} escrow mein lock hai. "
            f"Booking ID: {booking_id}. Time: {time_pref}."
        ),
        "provider_sms": (
            f"🔔 Naya booking! {service_type} service. "
            f"PKR {agreed_price} aapke liye escrow mein secure hai. "
            f"ID: {booking_id}. Time: {time_pref}."
        ),
        "rating_reminder": (
            f"Job complete hone ke 1 ghante baad aapko rating request milegi. "
            f"Booking {booking_id}."
        ),
        "reminder_scheduled_for": f"1 hour after {time_pref}",
    }


# ══════════════════════════════════════════════════════════
# ORCHESTRATOR — main entry point
# Runs agents 1 → 2 → 3 → 4 → 5 in strict sequence.
# Catches per-agent failures, logs them, and continues.
# Always returns JSON-serializable dict.
# ══════════════════════════════════════════════════════════

async def run_pipeline(text: str, db: Session) -> dict:
    agent_trace: list[dict] = []
    pipeline_status = "success"

    # ── Shared state across agents ─────────────────────────
    parsed: dict = {}
    providers: list[dict] = []
    top_provider: dict | None = None
    bid: dict = {}
    escrow: dict = {}
    followup: dict = {}
    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"

    # ══ AGENT 1: LinguisticAgent ══════════════════════════
    try:
        parsed = await linguistic_agent(text)
        agent_trace.append(_trace_entry(
            agent="LinguisticAgent",
            status="success",
            output=parsed,
            message=(
                f"Parsed: {parsed.get('serviceType')} in {parsed.get('location')}, "
                f"budget {parsed.get('budget')} PKR, time: {parsed.get('time')}"
            ),
        ))
    except Exception as exc:
        pipeline_status = "partial"
        parsed = {
            "serviceType": "Unknown",
            "location": DEFAULT_LOCATION,
            "budget": DEFAULT_BUDGET,
            "time": "flexible",
        }
        agent_trace.append(_trace_entry(
            agent="LinguisticAgent",
            status="error",
            error=str(exc),
            fallback=parsed,
            message="Falling back to defaults",
        ))

    # ══ AGENT 2: GeoAgent ═════════════════════════════════
    try:
        providers = geo_agent(parsed["serviceType"], db)
        if not providers:
            raise ValueError(
                f"No available {parsed['serviceType']} providers within {GEO_RADIUS_KM}km"
            )
        top_provider = providers[0]
        agent_trace.append(_trace_entry(
            agent="GeoAgent",
            status="success",
            output={"providers_found": len(providers), "top": top_provider["name"]},
            message=(
                f"Found {len(providers)} provider(s) within {GEO_RADIUS_KM}km. "
                f"Top match: {top_provider['name']} "
                f"({top_provider['distance_km']}km, ⭐{top_provider['rating']})"
            ),
        ))
    except Exception as exc:
        pipeline_status = "partial"
        agent_trace.append(_trace_entry(
            agent="GeoAgent",
            status="error",
            error=str(exc),
            message="No providers matched; downstream agents will be skipped",
        ))

    # ══ AGENT 3: BiddingAgent ════════════════════════════
    if top_provider:
        try:
            bid = bidding_agent(parsed["budget"], top_provider)
            agent_trace.append(_trace_entry(
                agent="BiddingAgent",
                status="success",
                output=bid,
                message=(
                    f"ZOPA result: {bid['action']}. "
                    + (
                        f"Agreed price: {bid['agreed_price']} PKR"
                        if bid["action"] != "REJECT"
                        else f"Provider min ({bid['provider_min']} PKR) exceeds client max"
                    )
                ),
            ))
        except Exception as exc:
            pipeline_status = "partial"
            bid = {"action": "ERROR", "agreed_price": parsed["budget"]}
            agent_trace.append(_trace_entry(
                agent="BiddingAgent",
                status="error",
                error=str(exc),
                fallback=bid,
            ))
    else:
        agent_trace.append(_trace_entry(
            agent="BiddingAgent",
            status="skipped",
            message="Skipped — no provider from GeoAgent",
        ))

    # ══ AGENT 4: EscrowAgent ═════════════════════════════
    agreed_price = bid.get("agreed_price")
    if agreed_price and bid.get("action") != "REJECT":
        try:
            escrow = escrow_agent(agreed_price)
            agent_trace.append(_trace_entry(
                agent="EscrowAgent",
                status="success",
                output=escrow,
                message=(
                    f"Escrow locked. ID: {escrow['escrow_id']}. "
                    f"Fee: {escrow['fee']} PKR ({escrow['fee_rate_pct']}%). "
                    f"Net to provider: {escrow['net_to_provider']} PKR."
                ),
            ))
        except Exception as exc:
            pipeline_status = "partial"
            agent_trace.append(_trace_entry(
                agent="EscrowAgent",
                status="error",
                error=str(exc),
            ))
    else:
        reason = "bid was REJECTED" if bid.get("action") == "REJECT" else "no agreed price"
        agent_trace.append(_trace_entry(
            agent="EscrowAgent",
            status="skipped",
            message=f"Skipped — {reason}",
        ))

    # ══ AGENT 5: FollowUpAgent ════════════════════════════
    if escrow.get("booking_id") and top_provider:
        try:
            followup = followup_agent(
                booking_id=escrow["booking_id"],
                provider_name=top_provider["name"],
                service_type=top_provider["service_type"],
                agreed_price=agreed_price,
                time_pref=parsed.get("time", "flexible"),
            )
            agent_trace.append(_trace_entry(
                agent="FollowUpAgent",
                status="success",
                output=followup,
                message=(
                    f"SMS sent to client and provider. "
                    f"Rating reminder scheduled for {followup['reminder_scheduled_for']}."
                ),
            ))
        except Exception as exc:
            pipeline_status = "partial"
            agent_trace.append(_trace_entry(
                agent="FollowUpAgent",
                status="error",
                error=str(exc),
            ))
    else:
        agent_trace.append(_trace_entry(
            agent="FollowUpAgent",
            status="skipped",
            message="Skipped — no confirmed booking to follow up on",
        ))

    # ── Persist job to DB ──────────────────────────────────
    try:
        job = Job(
            id=job_id,
            parsed=parsed,
            providers=providers,
            bid=bid or None,
            escrow=escrow or None,
            status=escrow.get("status", bid.get("action", "Searching")),
        )
        db.add(job)
        db.commit()
    except Exception as exc:
        # Non-fatal: pipeline result still returned
        agent_trace.append(_trace_entry(
            agent="System",
            status="error",
            error=f"Failed to persist job to DB: {exc}",
        ))

    # ── Final response ─────────────────────────────────────
    return {
        "job_id": job_id,
        "pipeline_status": pipeline_status,
        "parsed_request": parsed,
        "providers": providers,
        "bid": bid,
        "escrow": escrow,
        "followup": followup,
        "booking_confirmed": bool(escrow.get("booking_id")),
        "agent_trace": agent_trace,
    }
