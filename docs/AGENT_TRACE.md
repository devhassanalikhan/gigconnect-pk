# KaamGraph Multi-Agent Orchestration Trace

KaamGraph utilizes a powerful LangGraph-inspired multi-agent pipeline to process informal service requests autonomously. Here is a detailed trace of how these agents collaborate, self-heal, and dynamically adjust pricing.

## The Pipeline Operations

1. **LinguisticAgent**
   - **Role:** Parses natural language (Roman Urdu/English) to extract service type, budget, location, and timeframe.
   - **New Feature:** Calculates a `confidence` score. If confidence is low, it flags the request for clarification, triggering a visual warning in the app.
   - **New Feature:** Extracts `complexity` and `urgency` multipliers to be used for dynamic pricing downstream.

2. **SchedulingAgent (New Node)**
   - **Role:** Checks provider availability and prevents double-booking.
   - **Self-Healing:** If the top provider is booked for the requested timeslot, the SchedulingAgent automatically selects the next available matching provider. It avoids throwing errors by finding alternatives dynamically.

3. **GeoMatcherAgent**
   - **Role:** Scores nearby providers based on a comprehensive 6-factor matching algorithm:
     - **Distance (25%)**
     - **Quality Rating (20%)**
     - **Reliability/On-Time Score (20%)**
     - **Cancellation Risk (15%)**
     - **Price Fit (10%)**
     - **Experience (10%)**
   - **Self-Healing:** If no providers are found within 2km, it dynamically expands the search radius up to 10km to ensure matching success.

4. **BiddingAgent**
   - **Role:** Handles automated negotiation and dynamic pricing modeling.
   - **New Feature:** Uses the `urgency` and `complexity` multipliers provided by the LinguisticAgent to dynamically compute base costs. It generates a granular `price_breakdown` to justify the final proposed price, ensuring transparency in ZOPA negotiations on the mobile bidding board.

5. **EscrowAgent**
   - **Role:** Secures the milestone payment securely in a mock wallet before the provider is dispatched.

6. **FollowUpAgent**
   - **Role:** Dispatches SMS updates and manages post-booking checklists to ensure quality completion.

7. **DisputeAgent (Post-Pipeline Node)**
   - **Role:** Handles post-booking issues from the mobile receipt screen (e.g., no-shows, quality complaints). It autonomously computes provider penalties and client refunds based on structured resolution rules.
