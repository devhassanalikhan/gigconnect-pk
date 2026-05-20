import os
import sys
import asyncio
from dotenv import load_dotenv

# Load env
backend_path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend"
sys.path.insert(0, backend_path)
os.chdir(backend_path)
load_dotenv(".env")

from database import init_db
from database import SessionLocal
from orchestrator import _get_fallback_address, run_pipeline

def test_fallback_address_resolver():
    print("==================================================")
    print("TESTING FALLBACK ADDRESS RESOLVER")
    print("==================================================")
    
    # G-11 area coordinates: { "lat": 33.6655, "lng": 72.9922 }
    g11_address = _get_fallback_address(33.6650, 72.9920)
    print(f"Coordinates (33.6650, 72.9920) resolved to: {g11_address}")
    assert "G-11 Markaz" in g11_address or "G-11" in g11_address
    assert "Islamabad" in g11_address
    
    # Saddar area coordinates: { "lat": 33.5934, "lng": 73.0531 }
    saddar_address = _get_fallback_address(33.5930, 73.0530)
    print(f"Coordinates (33.5930, 73.0530) resolved to: {saddar_address}")
    assert "Saddar" in saddar_address
    assert "Rawalpindi" in saddar_address

    # Adyala Road coordinates: { "lat": 33.5500, "lng": 73.0200 }
    adyala_address = _get_fallback_address(33.5510, 73.0210)
    print(f"Coordinates (33.5510, 73.0210) resolved to: {adyala_address}")
    assert "Adyala Road" in adyala_address
    assert "Rawalpindi" in adyala_address
    
    print("SUCCESS: Fallback Address Resolver tests passed!\n")

async def test_pipeline_provider_addresses():
    print("==================================================")
    print("TESTING PIPELINE MATCH FOR ADDRESSES")
    print("==================================================")
    init_db()
    db = SessionLocal()
    try:
        res = await run_pipeline(
            text="Mujhe plumber chahiya ha adyala road par 2000 budget ha mera",
            db=db,
            user_lat=33.642,
            user_lng=73.076
        )
        providers = res.get("providers", [])
        print(f"Pipeline returned {len(providers)} candidates.")
        
        for idx, p in enumerate(providers):
            print(f"\nCandidate {idx+1}:")
            print(f"  Name:      {p.get('name')}")
            print(f"  Rating:    {p.get('rating')}")
            print(f"  Distance:  {p.get('distance')}")
            print(f"  Base Rate: {p.get('base_rate')}")
            print(f"  Address:   {p.get('address')}")
            
            # Assertions to ensure keys strictly exist and are formatted properly
            assert "address" in p, "Provider dictionary missing 'address' key!"
            assert "distance" in p, "Provider dictionary missing 'distance' key!"
            assert "base_rate" in p, "Provider dictionary missing 'base_rate' key!"
            assert p["address"] is not None, "Provider address is None!"
            assert isinstance(p["distance"], float), f"distance should be a float, got {type(p['distance'])}"
            assert isinstance(p["base_rate"], (int, float)), f"base_rate should be numerical, got {type(p['base_rate'])}"
            
        print("\nSUCCESS: Pipeline matches contains all structured fields flawlessly!")
    finally:
        db.close()

if __name__ == "__main__":
    test_fallback_address_resolver()
    asyncio.run(test_pipeline_provider_addresses())
