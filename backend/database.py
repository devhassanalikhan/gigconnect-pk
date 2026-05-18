# database.py
# SQLAlchemy database models and setup for GigConnect PK

from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, JSON
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


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)
    parsed = Column(JSON, nullable=False)       # Linguistic agent output
    providers = Column(JSON, nullable=False)    # Geo agent output
    bid = Column(JSON, nullable=True)           # Bidding agent output
    escrow = Column(JSON, nullable=True)        # Escrow agent output
    status = Column(String, default="Searching")
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Seed Data ────────────────────────────────────────────

SEED_PROVIDERS = [
    {"id":"p1","name":"Khan Plumbing","service_type":"Plumber","rating":4.7,"lat":33.6350,"lng":72.9810,"base_cost":1500,"is_available":True},
    {"id":"p2","name":"G13 Leak Fixers","service_type":"Plumber","rating":4.3,"lat":33.6420,"lng":72.9700,"base_cost":1200,"is_available":True},
    {"id":"p3","name":"City Plumbers","service_type":"Plumber","rating":4.5,"lat":33.6480,"lng":72.9750,"base_cost":1400,"is_available":True},
    {"id":"p4","name":"Ahmed Electric","service_type":"Electrician","rating":4.8,"lat":33.6411,"lng":72.9723,"base_cost":1800,"is_available":True},
    {"id":"p5","name":"FastFix Electric","service_type":"Electrician","rating":4.6,"lat":33.6290,"lng":72.9650,"base_cost":1600,"is_available":True},
    {"id":"p6","name":"Power Solutions","service_type":"Electrician","rating":4.4,"lat":33.6500,"lng":72.9900,"base_cost":1700,"is_available":True},
    {"id":"p7","name":"Ali AC Services","service_type":"AC Technician","rating":4.9,"lat":33.6380,"lng":72.9680,"base_cost":2000,"is_available":True},
    {"id":"p8","name":"CoolTech AC","service_type":"AC Technician","rating":4.4,"lat":33.6440,"lng":72.9760,"base_cost":1800,"is_available":True},
    {"id":"p9","name":"Arctic Cool","service_type":"AC Technician","rating":4.6,"lat":33.6350,"lng":72.9810,"base_cost":2200,"is_available":True},
    {"id":"p10","name":"HomeGlow Painters","service_type":"Painter","rating":4.8,"lat":33.6411,"lng":72.9723,"base_cost":2500,"is_available":True},
    {"id":"p11","name":"Islamabad Painters","service_type":"Painter","rating":4.2,"lat":33.6290,"lng":72.9650,"base_cost":2000,"is_available":True},
    {"id":"p12","name":"ColorPro","service_type":"Painter","rating":4.5,"lat":33.6500,"lng":72.9900,"base_cost":2300,"is_available":True},
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
    finally:
        db.close()


def get_db():
    """FastAPI dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
