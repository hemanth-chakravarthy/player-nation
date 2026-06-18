# PlayerNation: Technical Write-up & Architecture Choices

## 1. Data Pre-processing Pipeline

The primary engineering challenge of this project is transforming event-stream data (averaging ~1,400 events per match, including spatial coordinates, exact timestamps, player actions, and success tags) into a structured summary that fits within LLM context windows and remains semantically rich.

### Pre-processing Strategy
Rather than sending raw event JSON dumps directly to the LLM, the data pipeline aggregates events into high-level statistical features:
1. **Validation & Indexing:** On server startup, the `DatasetService` loads player metadata (3,600+ records) and team metadata in memory. Match files are loaded, and the event stream is lazily indexed by `matchId` to allow sub-second queries.
2. **Team-Level Statistics:** We compute:
   - **Shots & Shots on Target:** Filtering events by type `Shot` or `Penalty`. Success tags (e.g. Tag `1801` for Accurate/On Target, Tag `101` for Goal) are mapped to shots.
   - **Pass Accuracy & Volume:** Calculated as completed passes (Tag `1801` on a `Pass` event) divided by total attempted passes.
   - **Possession Estimate:** Since Wyscout has no raw duration-of-possession telemetry, we estimate possession based on the ratio of a team's completed passes to the total completed passes in the match.
3. **Player Performance Ratings:** An overall rating is calculated dynamically for each player on a `0 - 10` scale:
   $$\text{Rating} = 6.0 + (\text{Goals} \times 1.5) + (\text{Assists} \times 1.2) + (\text{Key Passes} \times 0.4) + (\text{Duels Won} \times 0.1) + (\text{Interceptions} \times 0.15)$$
   The ratings are capped at `10.0` and default to `6.0` for neutral play.
4. **Chronological Key Moments:** We track events sequentially. We identify goals, equalizers (when a goal makes the score level), penalties, red cards (Tags `1701` and `1703` on a foul), and own goals (Tag `102` on a shot/pass). Finally, we search the timeline to label the **Match Winner** (the last goal that changed the match outcome permanently).

---

## 2. LLM Integration & Prompt Design

### Prompt Engineering Strategy
The prompt is constructed dynamically by passing the pre-processed, highly structured metadata to the LLM instead of raw coordinates. This has several key benefits:
- **Hallucination Prevention:** By supplying exact numbers and chronological facts (e.g., "Griezmann scores at 37'"), the LLM is restricted from inventing imaginary players, goals, or bookings.
- **Context Window Efficiency:** The processed statistics and event timeline require less than 1.5K tokens, compared to over 80K tokens for raw event JSON streams.
- **Deterministic Response Formatting:** The LLM is forced to return a JSON object mapping a predefined schema via system prompts and API constraints (e.g., `responseMimeType: 'application/json'` in Gemini and `response_format: { type: "json_object" }` in Groq).

### JSON Schema
The response is parsed and validated at runtime using a Zod schema to ensure stability before sending the response to the mobile client:
```json
{
  "summary": "Match flow and final outcome summary...",
  "keyMoments": ["Chronological turning points analysis..."],
  "standoutPlayers": ["Standout performances and contributions..."],
  "teamAnalysis": "Tactical setups and team-level analysis...",
  "recommendations": ["Actionable tactical insights/recommendations..."]
}
```

---

## 3. Architecture & Trade-offs

### High-Level Design
- **Architecture Pattern:** MVVM (Model-View-ViewModel) on mobile, coupled with a lightweight REST API on the backend.
- **State Management:** Zustand (lightweight, zero boilerplate, reactive).
- **Database Caching:** PostgreSQL and Prisma ORM act as a persistence layer to cache generated tactical reports. Subsequent requests for the same match bypass the LLM and return instantly.
- **UI Framework:** Standard StyleSheet layouts (optimizing for render speed and avoiding compilation overhead associated with NativeWind Tailwind compiler configs).

```text
React Native Client (Zustand + React Native)
                    │
                    ▼ (HTTP REST)
         Fastify API (TypeScript)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
Local Dataset Engine      PostgreSQL DB (Prisma cache)
                                 │
                                 ▼ (On Cache Miss)
                          LLM Service (Gemini / Groq / Fallback)
```

### Key Trade-offs
1. **Thin Client vs. Strong Backend:** By running the data processing, database connections, and LLM calls on a Node.js server rather than on-device, we reduced the mobile bundle size significantly and kept API keys secured on the backend.
2. **PostgreSQL Caching:** Caching generated tactical reports reduces latency to milliseconds on repeated requests and cuts LLM token usage costs to zero.
3. **Multi-Provider Fallback:** The backend dynamically checks for Gemini or Groq keys. If both are missing, it falls back to a **Mock Intelligence Engine** that builds realistic reports from the statistics, guaranteeing the app works immediately.

---

## 4. Known Limitations & Future Improvements

### Current Limitations
- **Offline Mode:** The mobile app requires an active internet connection to reach the backend server to load and query matches.
- **Single-User Scope:** The database currently saves bookmarks under a default user context ("default_user_1"). It is prepared for user authorization (e.g., Auth0) but doesn't implement active session separation.

### Future Improvements
1. **Spatial Visualizations:** Wyscout provides spatio-temporal coordinates (X, Y) for every action. Future versions should use these coordinates on mobile to render heatmap SVG visuals of shots and passes.
2. **Expanded User Accounts:** Integrate OAuth / JWT auth flow to support personal user accounts and custom user-to-saved-reports mapping.
