# database.py
# SQLAlchemy database models and setup for GigConnect PK

from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Models ───────────────────────────────────────────────

class Provider(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    service_type = Column(String, nullable=False)
    rating = Column(Float, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    base_cost = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # NEW FIELDS — Required by judges for 6-factor matching
    on_time_score = Column(Float, default=0.88)        # reliability 0.0-1.0
    cancellation_rate = Column(Float, default=0.04)    # lower is better
    experience_years = Column(Integer, default=3)
    total_jobs_completed = Column(Integer, default=45)
    review_recency_score = Column(Float, default=0.82) # how recent reviews are
    specializations = Column(JSON, default=list)       # e.g. ["leak_repair", "pipe_fitting"]
    risk_score = Column(Float, default=0.12)           # lower is better
    capacity_available = Column(Integer, default=2)    # slots available today


class Dispute(Base):
    __tablename__ = "disputes"
    id = Column(String, primary_key=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    dispute_type = Column(String, nullable=False)  # no_show, quality_complaint, price_disagreement, cancellation
    description = Column(String, nullable=True)
    resolution = Column(JSON, nullable=True)
    status = Column(String, default="Open")  # Open, Resolved, Escalated
    created_at = Column(DateTime, default=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)
    parsed = Column(JSON, nullable=False)       # Linguistic agent output
    providers = Column(JSON, nullable=False)    # Geo agent output
    bid = Column(JSON, nullable=True)           # Bidding agent output
    escrow = Column(JSON, nullable=True)        # Escrow agent output
    status = Column(String, default="Searching")
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_time = Column(String, nullable=True)
    provider_id_assigned = Column(String, nullable=True)
    job_complexity = Column(String, default="basic")  # basic, intermediate, complex
    confidence_score = Column(Float, nullable=True)   # from LinguisticAgent


# ─── Seed Data ────────────────────────────────────────────

SEED_PROVIDERS = [
    {"id":"p1","name":"Khan Plumbing","service_type":"Plumber","rating":4.7, "lat":33.6350,"lng":72.9810,"base_cost":1500,"is_available":True, "on_time_score":0.93,"cancellation_rate":0.03,"experience_years":8, "total_jobs_completed":124,"review_recency_score":0.91, "specializations":["leak_repair","pipe_fitting","bathroom_installation"], "risk_score":0.07,"capacity_available":2},
    {"id":"p2","name":"G13 Leak Fixers","service_type":"Plumber","rating":4.3, "lat":33.6420,"lng":72.9700,"base_cost":1200,"is_available":True, "on_time_score":0.85,"cancellation_rate":0.08,"experience_years":4, "total_jobs_completed":65,"review_recency_score":0.75, "specializations":["leak_repair"], "risk_score":0.15,"capacity_available":1},
    {"id":"p3","name":"City Plumbers","service_type":"Plumber","rating":4.5, "lat":33.6480,"lng":72.9750,"base_cost":1400,"is_available":True, "on_time_score":0.88,"cancellation_rate":0.05,"experience_years":5, "total_jobs_completed":89,"review_recency_score":0.80, "specializations":["pipe_fitting","bathroom_installation"], "risk_score":0.10,"capacity_available":3},
    {"id":"p4","name":"Ahmed Electric","service_type":"Electrician","rating":4.8, "lat":33.6411,"lng":72.9723,"base_cost":1800,"is_available":True, "on_time_score":0.95,"cancellation_rate":0.02,"experience_years":10, "total_jobs_completed":210,"review_recency_score":0.95, "specializations":["wiring","short_circuit","ups_installation"], "risk_score":0.05,"capacity_available":2},
    {"id":"p5","name":"FastFix Electric","service_type":"Electrician","rating":4.6, "lat":33.6290,"lng":72.9650,"base_cost":1600,"is_available":True, "on_time_score":0.90,"cancellation_rate":0.04,"experience_years":6, "total_jobs_completed":115,"review_recency_score":0.88, "specializations":["wiring","short_circuit"], "risk_score":0.08,"capacity_available":4},
    {"id":"p6","name":"Power Solutions","service_type":"Electrician","rating":4.4, "lat":33.6500,"lng":72.9900,"base_cost":1700,"is_available":True, "on_time_score":0.82,"cancellation_rate":0.07,"experience_years":3, "total_jobs_completed":55,"review_recency_score":0.78, "specializations":["ups_installation"], "risk_score":0.12,"capacity_available":1},
    {"id":"p7","name":"Ali AC Services","service_type":"AC Technician","rating":4.9, "lat":33.6380,"lng":72.9680,"base_cost":2000,"is_available":True, "on_time_score":0.96,"cancellation_rate":0.01,"experience_years":12, "total_jobs_completed":305,"review_recency_score":0.98, "specializations":["gas_filling","compressor_repair","installation"], "risk_score":0.03,"capacity_available":2},
    {"id":"p8","name":"CoolTech AC","service_type":"AC Technician","rating":4.4, "lat":33.6440,"lng":72.9760,"base_cost":1800,"is_available":True, "on_time_score":0.84,"cancellation_rate":0.06,"experience_years":4, "total_jobs_completed":72,"review_recency_score":0.81, "specializations":["gas_filling","installation"], "risk_score":0.11,"capacity_available":3},
    {"id":"p9","name":"Arctic Cool","service_type":"AC Technician","rating":4.6, "lat":33.6350,"lng":72.9810,"base_cost":2200,"is_available":True, "on_time_score":0.89,"cancellation_rate":0.05,"experience_years":7, "total_jobs_completed":145,"review_recency_score":0.85, "specializations":["compressor_repair","installation"], "risk_score":0.09,"capacity_available":1},
    {"id":"p10","name":"HomeGlow Painters","service_type":"Painter","rating":4.8, "lat":33.6411,"lng":72.9723,"base_cost":2500,"is_available":True, "on_time_score":0.92,"cancellation_rate":0.03,"experience_years":9, "total_jobs_completed":180,"review_recency_score":0.90, "specializations":["interior","exterior","texture"], "risk_score":0.06,"capacity_available":2},
    {"id":"p11","name":"Islamabad Painters","service_type":"Painter","rating":4.2, "lat":33.6290,"lng":72.9650,"base_cost":2000,"is_available":True, "on_time_score":0.78,"cancellation_rate":0.10,"experience_years":2, "total_jobs_completed":35,"review_recency_score":0.70, "specializations":["interior"], "risk_score":0.18,"capacity_available":5},
    {"id":"p12","name":"ColorPro","service_type":"Painter","rating":4.5, "lat":33.6500,"lng":72.9900,"base_cost":2300,"is_available":True, "on_time_score":0.87,"cancellation_rate":0.05,"experience_years":5, "total_jobs_completed":95,"review_recency_score":0.82, "specializations":["interior","exterior"], "risk_score":0.10,"capacity_available":3},
]


def init_db():
    """Create all tables and seed provider data if the table is empty."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.query(Provider).count() == 0:
            for p in SEED_PROVIDERS:
                db.add(Provider(**p))
            db.commit()
        if db.query(Job).count() == 0:
            # Seed a pre-existing job to trigger double-booking conflict for Ahmed Electric (p4)
            conflict_job = Job(
                id="JOB-SEEDCONFLICT",
                parsed={"serviceType": "Electrician", "location": "G-13", "time": "urgent", "budget": 1800, "urgency": "high", "job_complexity": "basic", "confidence": 1.0},
                providers=[],
                bid={"action": "ACCEPT", "agreed_price": 1800},
                escrow={"status": "MilestoneLocked"},
                status="MilestoneLocked",
                provider_id_assigned="p4",
                scheduled_time="urgent"
            )
            db.add(conflict_job)
            db.commit()
    finally:
        db.close()


def get_db():
    """FastAPI dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
