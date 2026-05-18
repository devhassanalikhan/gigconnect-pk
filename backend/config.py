# config.py
# Centralized configuration management for GigConnect PK

import os
from dotenv import load_dotenv

load_dotenv()

# ─── AI Configuration ──────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ─── Database Configuration ────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gigconnect.db")

# ─── App Configuration ─────────────────────────────────────
APP_TITLE: str = "KaamGraph API"
APP_VERSION: str = "1.1.0"
CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

# ─── Geo Defaults ──────────────────────────────────────────
# Default user coordinates (Islamabad G-13 area)
DEFAULT_USER_LAT: float = float(os.getenv("DEFAULT_USER_LAT", "33.6411"))
DEFAULT_USER_LNG: float = float(os.getenv("DEFAULT_USER_LNG", "72.9723"))
GEO_RADIUS_KM: float = float(os.getenv("GEO_RADIUS_KM", "5.0"))
MAX_PROVIDERS_RETURNED: int = int(os.getenv("MAX_PROVIDERS_RETURNED", "3"))

# ─── Escrow Configuration ──────────────────────────────────
ESCROW_FEE_RATE: float = float(os.getenv("ESCROW_FEE_RATE", "0.0999"))
TRANSPORT_COST_PER_KM: float = float(os.getenv("TRANSPORT_COST_PER_KM", "80.0"))

# ─── Default Fallbacks ─────────────────────────────────────
DEFAULT_BUDGET: int = int(os.getenv("DEFAULT_BUDGET", "2000"))
DEFAULT_LOCATION: str = os.getenv("DEFAULT_LOCATION", "Islamabad")
