# KaamGraph — Pakistan's 1st Agentic Service Orchestrator

## 🚀 Overview
**KaamGraph** is a zero-barrier digital inclusion engine designed to integrate Pakistan's informal service sector (plumbers, electricians, AC technicians, painters, carpenters, and cleaners) into the formal digital economy. Powered by a state-passing sequential multi-agent orchestration architecture, it processes unstructured bilingual inputs (Roman Urdu and English) to automate the entire lifecycle of informal service gig discovery, validation, price negotiation, safe payment custody, and dispatch notifications.

---

## 🛠️ Core Tech Stack
- **Frontend**: React Native, Expo SDK 54, TypeScript, React Navigation, React Native Safe Area Context, and custom high-fidelity HSL glassmorphic dark themes.
- **Backend**: FastAPI (Python), SQLite (with SQLAlchemy) for local development and database seeding, and Supabase DB capability.
- **AI Orchestration**: Google Gemini 2.5 Flash, structured NLU intent parser, and sequential state-passing multi-agent pipelines.
- **Localization**: Bilingual translation engine (`اردو` / `EN`) with dynamic localization of lists, categories, status trackers, and checkout screens.

---

## 🤖 Multi-Agent Architecture (Antigravity Pipeline)
KaamGraph coordinates 7 specialized cognitive agents in a sequential execution pipeline to safely fulfill requests:

1. **LinguisticAgent (Urdu Parser & NLU)**:
   - Processes raw Roman Urdu or English messages.
   - Extracts service category, timeframe, and computes target complexity and urgency multipliers.
2. **SchedulingAgent (Availability Guard)**:
   - Queries database provider calendars.
   - Self-heals slot booking conflicts dynamically by selecting fallback availability schedules.
3. **GeoAgent (Proximity Matcher)**:
   - Performs a 6-factor proximity and quality calculation (Distance, Rating, On-time reliability, Cancel risk, Budget fit, Experience).
   - Dynamically expands the geo-boundary radius (from 2km up to 10km) if local supply is empty.
4. **BiddingAgent (Dynamic Negotiator)**:
   - Models counter-bid ranges dynamically defining the Zone of Possible Agreement (ZOPA).
   - Generates interactive, color-shifting probability ranges and fast-multiplier selection pills.
5. **EscrowAgent (AI Escrow Engine Lock)**:
   - Computes platform fees, secures funds, and locks payments under an escrow agreement state (`ESCR_LOCKED`).
6. **FollowUpAgent (background SMS Dispatcher)**:
   - Automates SMS dispatch templates and provider NADRA/police clearance confirmations.
7. **DisputeAgent (Post-gig Arbitrator)**:
   - Resolves customer disputes and automates provider penalties/refunds.

---

## 🔌 Integrated Mock / Real APIs
- **Google Places API / Apify Map Scrapers**: Active geocoding and external business listings lookup with real distance calculation.
- **Twilio SMS / Notification Dispatch**: Simulated message payloads for local telecommunication delivery.
- **Expo Linking API**: Initiates direct cell carrier voice calls to providers from map carousel cards.

---

## 🚦 System Highlights & Resilience Features
- **Heuristic Greeting Gate**: Skips the heavy agent pipeline for casual conversations (greetings resolved in <200ms).
- **Offline / Mock Mode**: Toggleable mock service state inside `.env` configurations for deterministic presentation recordings.
- **Zero-Configuration LAN IP Auto-Resolution**: Resolves local WiFi IP addresses dynamically using Expo Constants, enabling physical mobile devices to synchronize with local servers automatically.
