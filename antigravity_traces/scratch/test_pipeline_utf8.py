import os
import sys
import asyncio
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use utf-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Load env
backend_path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend"
sys.path.insert(0, backend_path)
os.chdir(backend_path)
load_dotenv(".env")

from database import init_db, get_db
from orchestrator import run_pipeline

async def test():
    # Get a session
    init_db()
    from database import SessionLocal
    db = SessionLocal()
    try:
        res = await run_pipeline(
            text="Mujhe plumber chahiya ha adyala road par 2000 budget ha mera",
            db=db,
            user_lat=33.642,
            user_lng=73.076
        )
        print("PIPELINE RESULT:")
        print("job_id:", res.get("job_id"))
        print("pipeline_status:", res.get("pipeline_status"))
        print("bid:", res.get("bid"))
        print("escrow:", res.get("escrow"))
        print("booking_confirmed:", res.get("booking_confirmed"))
    finally:
        db.close()

asyncio.run(test())
