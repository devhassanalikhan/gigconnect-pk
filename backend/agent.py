# agent.py
# Antigravity Agent definitions (documented for judges)
# Live agent runs in Antigravity Studio: agent_1778964020775

AGENT_CONFIG = {
    "platform": "Google Antigravity (Vertex AI Agent Platform)",
    "agent_id": "agent_1778964020775",
    "model": "gemini-2.5-pro",
    "agents": [
        {
            "name": "Linguistic_Agent",
            "model": "gemini-2.0-flash",
            "role": "Parses Roman Urdu, Urdu, English requests"
        },
        {
            "name": "Geo_Agent", 
            "model": "gemini-2.0-flash",
            "role": "Finds nearby providers within 5km"
        },
        {
            "name": "Bidding_Agent",
            "model": "gemini-2.0-flash", 
            "role": "Runs reverse-bid ZOPA negotiation"
        },
        {
            "name": "Escrow_Agent",
            "model": "gemini-2.0-flash",
            "role": "Locks payment with 9.99% fee"
        },
        {
            "name": "Followup_Agent",
            "model": "gemini-2.0-flash",
            "role": "Sends confirmations and reminders"
        }
    ]
}