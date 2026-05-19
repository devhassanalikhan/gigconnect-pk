# Complete Fix: Real Map, Real Search, Real Data

## ✅ Step 1: Fix Google Maps API Key (Critical)

Your `.env` file still has placeholder. Update it:

```bash
cd mobile

# Edit .env with your real key
# Mac/Linux:
sed -i 's/YOUR_GOOGLE_MAPS_API_KEY_HERE/AIzaSy...YOUR_ACTUAL_KEY/g' .env

# OR Windows/Manual:
# Open .env and replace:
# GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
# With:
# GOOGLE_MAPS_API_KEY=AIzaSy...YOUR_REAL_KEY
```

**Verify the key is there:**
```bash
cat .env | grep GOOGLE_MAPS_API_KEY
# Should show: GOOGLE_MAPS_API_KEY=AIzaSy...actualkey
```

Then **restart dev server:**
```bash
npm run web
```

Map should now be visible! ✅

---

## ✅ Step 2: Add Real Providers to Database

The app queries real providers from backend, but backend only has **seed data** (Khan Plumbing, etc.).

### Option A: Add via Python (Recommended)

```python
# Add to backend/main.py or create seed_real_data.py

from database import Provider, engine, SessionLocal

real_providers = [
    {
        "id": "p_ali_town_plumb_001",
        "name": "Ali Town Plumbing Services",
        "service_type": "Plumber",
        "rating": 4.8,
        "lat": 33.6350,
        "lng": 72.9810,
        "address": "Ali Town, Rawalpindi",
        "base_cost": 1200,
        "is_available": True
    },
    {
        "id": "p_ali_town_elect_002",
        "name": "Ali Town Electric Hub",
        "service_type": "Electrician",
        "rating": 4.6,
        "lat": 33.6340,
        "lng": 72.9820,
        "address": "Ali Town Market, Rawalpindi",
        "base_cost": 1500,
        "is_available": True
    },
    # Add more real providers...
]

db = SessionLocal()
for provider_data in real_providers:
    # Check if already exists
    existing = db.query(Provider).filter(
        Provider.id == provider_data["id"]
    ).first()
    if not existing:
        db.add(Provider(**provider_data))
        db.commit()
        print(f"✓ Added: {provider_data['name']}")
    else:
        print(f"⚠ Already exists: {provider_data['name']}")
db.close()
```

### Option B: Clear Database & Restart

```bash
# Delete the database file (SQLite)
rm backend/database.db

# Or (PostgreSQL):
# DROP TABLE provider; DROP TABLE job; DROP TABLE dispute;

# Restart backend - it will auto-seed
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## ✅ Step 3: Verify Real Data is Being Returned

```bash
# Test backend
curl http://localhost:8000/api/providers

# Should return JSON like:
{
  "providers": [
    {
      "id": "p1",
      "name": "Khan Plumbing",
      "service_type": "Plumber",
      "rating": 4.7,
      "lat": 33.6350,
      "lng": 72.9810,
      "base_cost": 1500,
      "is_available": true
    },
    ...
  ]
}
```

If you see **real providers** (not seed), ✅ Backend is working.

---

## ✅ Step 4: Fix Search (Now Returns Results)

The app filters providers by:
- Name (e.g., "Khan Plumbing" contains "Khan")
- Category (e.g., "Plumber" contains "Plumb")
- Address (e.g., "Ali Town" contains "Ali")

When you search **"ali town"**:
- ✅ If you added "Ali Town Electric Hub" to database → It will match!
- ❌ If database only has "Khan Plumbing" → No match (shows "0 PROVIDERS FOUND")

**So: Add real providers to database matching your search queries!**

---

## ✅ Step 5: Chatbot Now Shows Real Data

The chatbot (`/api/match` endpoint) runs the AI orchestration and calls `/api/providers`.

It will show:
1. **Seed providers** → If database is empty (first run)
2. **Real providers** → If you added them to database ✅

---

## 🔧 Quick Setup (Recommended)

```bash
# Terminal 1: Backend with real data
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Update .env with your Google Maps key
cd mobile
cat > .env << 'EOF'
API_BASE_URL_WEB=http://localhost:8000
API_BASE_URL_MOBILE=http://192.168.100.5:8000
GOOGLE_MAPS_API_KEY=AIzaSy...YOUR_ACTUAL_KEY_HERE
DEFAULT_LATITUDE=33.6411
DEFAULT_LONGITUDE=72.9723
EOF

# Restart dev server
npm run web

# Terminal 3: Add real providers to database (one-time)
python << 'EOF'
from backend.database import Provider, SessionLocal

providers = [
    {"id": "p_001", "name": "Ali Town Plumber", "service_type": "Plumber", "rating": 4.8, "lat": 33.635, "lng": 72.981, "address": "Ali Town, Rawalpindi", "base_cost": 1200, "is_available": True},
    {"id": "p_002", "name": "Ali Town Electrician", "service_type": "Electrician", "rating": 4.6, "lat": 33.634, "lng": 72.982, "address": "Ali Town Market", "base_cost": 1500, "is_available": True},
]

db = SessionLocal()
for p in providers:
    db.add(Provider(**p))
db.commit()
print("✓ Added real providers!")
db.close()
EOF
```

---

## 🎯 Expected Results After All Fixes

| Issue | Before | After |
|-------|--------|-------|
| Map visible | ❌ Black screen | ✅ Shows map |
| Search "ali town" | ❌ 0 providers | ✅ Shows results |
| Chatbot results | ❌ Generic seed data | ✅ Real providers |
| Google Places | ❌ No suggestions | ✅ Location autocomplete works |

---

## 📝 Next: Add More Real Data

Create more providers by:
1. Insert via Python script ↑
2. Build an admin panel to add providers
3. Migrate from existing database
4. Use `/api/match` with real service requests to populate jobs

Now test and let me know if:
- ✅ Map is visible after adding API key
- ✅ Search returns results after adding providers
- ✅ Chatbot shows real providers
