import os
import sys
from dotenv import load_dotenv

# Load env
backend_path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend"
sys.path.insert(0, backend_path)
os.chdir(backend_path)
load_dotenv(".env")

from orchestrator import bidding_agent

provider = {
    "name": "Awais plumber electrician",
    "base_cost": 1700,
    "distance_km": 12.07,
}

res = bidding_agent(budget=2000.0, provider=provider, urgency="medium")
print("BiddingAgent Result:", res)
