# main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from database import init_db, get_db, Job, Provider
from orchestrator import (
    run_pipeline,
    bidding_agent,
    escrow_agent,
    followup_agent,
    _haversine,
)
from config import DEFAULT_USER_LAT, DEFAULT_USER_LNG

# ─── App Setup ────────────────────────────────────────────
app = FastAPI(title=APP_TITLE, version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ─── Request Models ────────────────────────────────────────
class MatchRequest(BaseModel):
    text: str


class BidRequest(BaseModel):
    job_id: str
    provider_id: str
    budget: float


class EscrowRequest(BaseModel):
    job_id: str
    provider_id: str
    agreed_price: float


# ─── Helpers ───────────────────────────────────────────────
def _provider_to_dict(p: Provider) -> dict:
    return {
        "id": p.id, "name": p.name, "service_type": p.service_type,
        "rating": p.rating, "lat": p.lat, "lng": p.lng,
        "base_cost": p.base_cost, "is_available": p.is_available,
    }


# ══════════════════════════════════════════════════════════
# PRIMARY ENDPOINT — runs full 5-agent pipeline
# ══════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"status": f"{APP_TITLE} Running", "version": APP_VERSION}


@app.post("/api/match")
async def match_providers(req: MatchRequest, db: Session = Depends(get_db)):
    """
    Full orchestrator endpoint.
    Runs LinguisticAgent → GeoAgent → BiddingAgent → EscrowAgent → FollowUpAgent.
    Returns complete agent_trace and booking result.
    """
    return await run_pipeline(req.text, db)


# ══════════════════════════════════════════════════════════
# SECONDARY ENDPOINTS — manual step-by-step control
# (for clients that want granular booking flow)
# ══════════════════════════════════════════════════════════

@app.post("/api/bid")
async def place_bid(req: BidRequest, db: Session = Depends(get_db)):
    trace = []
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        return {"error": "Job not found"}

    provider = db.query(Provider).filter(Provider.id == req.provider_id).first()
    if not provider:
        return {"error": "Provider not found"}

    p_dict = _provider_to_dict(provider)
    p_dict["distance_km"] = _haversine(
        DEFAULT_USER_LAT, DEFAULT_USER_LNG, provider.lat, provider.lng
    )

    trace.append(f"[BiddingAgent] Client budget: {req.budget} PKR")
    trace.append(f"[BiddingAgent] Provider: {provider.name}, Base: {provider.base_cost} PKR")

    bid = bidding_agent(req.budget, p_dict)
    trace.append(f"[BiddingAgent] Decision: {bid['action']} at {bid.get('agreed_price')} PKR")

    job.bid = bid
    job.status = "BidPlaced"
    db.commit()

    return {"job_id": req.job_id, "provider": provider.name, "bid": bid, "trace": trace}


@app.post("/api/escrow/lock")
async def lock_escrow(req: EscrowRequest, db: Session = Depends(get_db)):
    trace = []
    provider = db.query(Provider).filter(Provider.id == req.provider_id).first()
    if not provider:
        return {"error": "Provider not found"}

    trace.append(f"[EscrowAgent] Locking {req.agreed_price} PKR...")
    escrow = escrow_agent(req.agreed_price)
    trace.append(f"[EscrowAgent] Fee: {escrow['fee']} PKR ({escrow['fee_rate_pct']}%)")
    trace.append(f"[EscrowAgent] Net to provider: {escrow['net_to_provider']} PKR")
    trace.append(f"[EscrowAgent] Escrow ID: {escrow['escrow_id']}")

    job = db.query(Job).filter(Job.id == req.job_id).first()
    parsed = job.parsed if job else {}

    fu = followup_agent(
        booking_id=escrow["booking_id"],
        provider_name=provider.name,
        service_type=provider.service_type,
        agreed_price=req.agreed_price,
        time_pref=parsed.get("time", "flexible"),
    )
    trace.append("[FollowUpAgent] Confirmations sent to client and provider")

    if job:
        job.escrow = escrow
        job.status = "MilestoneLocked"
        db.commit()

    return {"job_id": req.job_id, "escrow": escrow, "followup": fu, "trace": trace}


@app.get("/api/job/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return {"error": "Job not found"}
    return {
        "id": job.id, "parsed": job.parsed, "providers": job.providers,
        "bid": job.bid, "escrow": job.escrow, "status": job.status,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@app.get("/api/providers")
def get_providers(db: Session = Depends(get_db)):
    return {"providers": [_provider_to_dict(p) for p in db.query(Provider).all()]}