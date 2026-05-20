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

## ⚡ Zero-Configuration Dynamic IP Auto-Resolution

To make development and review frictionless, **KaamGraph** has been upgraded with **Automatic LAN IP Discovery**. 

### How it works:
1. Physical mobile devices running **Expo Go** must connect to the same Wi-Fi subnet as your development machine.
2. Rather than forcing you to find your local IP and manually edit `.env` or `config.ts` files, the mobile client dynamically reads the running Expo dev server packager configuration (`Constants.expoConfig?.hostUri`).
3. It splits this URI and constructs the API base URL dynamically (e.g. `http://<YOUR_IP>:8000`).
4. This ensures that physical mobile devices can always synchronize and communicate with your backend FastAPI server without manual configuration.

---

## 🚀 Quick Start

```bash
# Terminal 1: Start backend
cd backend
python main.py  # Bounds to 0.0.0.0:8000 with hot-reloading auto-active

# Terminal 2: Configure variables
cd mobile
cat > .env << EOF
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_REAL_API_KEY_HERE
DEFAULT_LATITUDE=33.6411
DEFAULT_LONGITUDE=72.9723
EOF

# Terminal 3: Start dev server
npm run web  # Or 'npx expo start' to scan the QR code on a physical phone
```

Then:
1. Check the terminal/console logs. You will see a log stating `[KaamGraph] API_BASE_URL configured as: http://<YOUR_IP>:8000` (on mobile) or `http://localhost:8000` (on web).
2. If you see warnings about a missing API key, restart your dev server with `npx expo start -c`.
3. Tap the GPS icon to verify if the map loads.
4. Search for a location or query an AI Match.

---

## 📋 What to Share

To help debug, provide:
1. Output of: `curl http://localhost:8000/api/providers`
2. Browser console logs (look for GOOGLE_MAPS_API_KEY warnings)
3. Confirm: Is the backend returning real providers or seed data?
