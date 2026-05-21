# Execution Tasks - Map Tab Overhaul & Direct Calling Integration

- `[x]` Update Backend Providers Seed Data (`backend/main.py`)
  - `[x]` Seed distinct local phone numbers for mock candidates
  - `[x]` Implement `lat` / `lng` parameter matching and haversine sorting on `/api/providers`
- `[x]` Upgrade Map Screen Component (`mobile/screens/MapScreen.tsx`)
  - `[x]` Declare complete `MapProvider` TypeScript interface with `latitude` and `longitude`
  - `[x]` Implement floating Search Bar with geocoding lookup and keyboard submit bindings
  - `[x]` Safely parse geometry coordinates for API responses (both Google Places and local mock)
  - `[x]` Replace Carousel ScrollView with high-performance horizontal `<FlatList>` component
  - `[x]` Integrate click-to-call `Linking.openURL('tel:${item.phone_number}')` safeguards
  - `[x]` Implement absolute glassmorphic overlays for `isLoading` spinner and `providers.length === 0` amber warnings
- `[x]` Verify TypeScript Safety and Compile Correctness
  - `[x]` Run `npx tsc --noEmit` inside `mobile/` to check and ensure zero compilation errors
- `[x]` Enhance KaamGraph Home Screen UI/UX (`mobile/screens/HomeScreen.tsx`)
  - `[x]` Build cycling placeholders rotating local Roman Urdu prompts every 3s
  - `[x]` Integrate Voice Search microphone button on Hero prompt input
  - `[x]` Add horizontal Live Escrow Activity Feed ticker under Hero card
  - `[x]` Refactor active job tracking progress bar with glowing agent step nodes
  - `[x]` Overlay absolute-positioned green liquidity count badges on Category Cards
  - `[x]` Confirm clean compiling and Zero TypeScript errors with `npx tsc --noEmit`

- `[x]` Overhaul Chat Screen Booking Selection & Escrow Lock Workflow (`SearchScreen.tsx`)
  - `[x]` Capture & persist selected provider states (`selectedProvider`, `isBookingLoading`, `isBookingConfirmed`)
  - `[x]` Align escrow payload transmission inside `handleLockAndBookOffer` with fallbacks and exact specified POST body
  - `[x]` Modify backend `EscrowRequest` schema and `/api/escrow/lock` in `backend/main.py` to seamlessly accept `booking_id` and `amount`
  - `[x]` Implement robust visual selection checks and fallback fields for provider card rendering
  - `[x]` Intercept standard rendering with premium confirmation box if `isBookingConfirmed === true`
  - `[x]` Bind press handlers and loading states to button, verify zero compile errors via `npx tsc --noEmit`
