# Setup Guide: Fix Map, Real Data & Chat

## 🔴 Problem 1: Map is Black (No Rendering)

**Cause:** Google Maps API key is not configured.

**Fix:**
```bash
# 1. Update .env with your REAL key
cd mobile
nano .env  # or open in editor
```

Change:
```
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

To:
```
GOOGLE_MAPS_API_KEY=AIzaSyA...YOUR_REAL_KEY_HERE
```

Then **restart your dev server:**
```bash
npm run web  # or android/ios
```

---

## 🔴 Problem 2: Search for "ali town" Returns 0 Providers

**Cause:** Backend not returning real provider data + no Places API results.

**Check:** Backend is returning dummy data?
```bash
# Test backend directly
curl http://localhost:8000/api/providers
```

Expected: Real provider list from your database  
Getting: Dummy local seed providers instead

**Fix:**
1. Ensure your backend `GET /api/providers` returns real providers from database
2. Backend response format should be:
```json
{
  "providers": [
    {
      "id": "provider_id",
      "name": "Real Provider Name",
      "service_type": "Plumber",
      "rating": 4.5,
      "lat": 33.6411,
      "lng": 72.9723,
      "address": "Real Address, Islamabad",
      "base_cost": 1500
    }
  ]
}
```

---

## 🔴 Problem 3: Chatbot Returns Dummy Data

**Location:** `localhost:8081` (KaamGraph AI Chat)

**Cause:** Backend `/api/providers` returning seed data instead of real data.

**Fix:** Update backend to:
1. Query database for real providers based on service type
2. Filter by user's location/sector
3. Return real ratings from database

**Backend should look like:**
```python
@app.get("/api/providers")
async def get_providers(
    lat: float = 33.6411,
    lng: float = 72.9723,
    service_type: str = None
):
    # Query database for real providers
    providers = db.query(Provider).filter(
        Provider.service_type == service_type
    ).all()
    
    return {"providers": [p.to_dict() for p in providers]}
```

---

## ✅ Verification Checklist

- [ ] `.env` has your REAL Google Maps API key (not placeholder)
- [ ] Dev server restarted after .env change
- [ ] Backend running at `http://localhost:8000`
- [ ] `curl http://localhost:8000/api/providers` returns real providers (not seed data)
- [ ] Map now shows when you open app
- [ ] Search "ali town" returns results from Google Places API
- [ ] Chatbot shows real providers, not dummy Khan Plumbing

---

## 🚀 Quick Start

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Add your API key
cd mobile
cat > .env << EOF
API_BASE_URL_WEB=http://localhost:8000
API_BASE_URL_MOBILE=http://192.168.100.5:8000
GOOGLE_MAPS_API_KEY=YOUR_REAL_API_KEY_HERE
DEFAULT_LATITUDE=33.6411
DEFAULT_LONGITUDE=72.9723
EOF

# Terminal 3: Start dev server
npm run web
```

Then:
1. Check `console` logs for "API_BASE_URL configured as: http://localhost:8000"
2. If you see warnings about missing API key, the key wasn't picked up—restart dev server
3. Tap GPS icon to see if map loads
4. Search for a location

---

## 📋 What to Share

To help debug, provide:
1. Output of: `curl http://localhost:8000/api/providers`
2. Browser console logs (look for GOOGLE_MAPS_API_KEY warnings)
3. Confirm: Is the backend returning real providers or seed data?
