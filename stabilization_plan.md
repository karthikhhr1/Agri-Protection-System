# AgriGuard End-to-End Stabilization Plan (Functional -> Fast -> Fancy)

Date: 2026-02-08
Last updated: 2026-02-09

Repo: React (Vite) + Express (TS) + Postgres (Drizzle) with shared Zod schemas.

Primary goal: take these to full end-to-end functionality and stabilize the whole app:
- Irrigation detection + advice + history + settings
- Plant disease/pest detection (drone/camera image analysis) end-to-end
- Audio deterrent (wildlife detection -> auto rules -> logs -> optional sound output) end-to-end

Order of operations is strict:
1. Functional: correct behavior, correct wiring, correct data.
2. Fast: reduce latency, reduce load, scale safely.
3. Fancy: polish UX, visuals, delight (without regressing #1/#2).

---

## 0) Definitions (So We Can Finish Cleanly)

### 0.1 “End-to-End Working” Definition
Each module is considered complete only when ALL are true:
- UI flow works from the main navigation and from the dashboard.
- Server endpoints exist, validate input, return stable response shapes, and write to DB where appropriate.
- DB records show up correctly in history feeds.
- Activity logs record key events (detection/irrigation/deterrent/system).
- Errors are handled with clear UI messaging.
- Feature works in at least:
  - Desktop Chrome (latest)
  - Mobile Safari/Chrome (latest)

### 0.2 Performance Budgets (Targets)
Functional must be done first, but we’ll keep these budgets in mind:
- “Create report -> analysis complete” UI feedback: progress shown immediately, no “dead” waits.
- Page interactions: < 100ms perceived latency for clicks/toggles.
- API p95 response times (excluding OpenAI): < 250ms on average dev DB.
- AI processing: reduce image payload size; aim for 2-8s typical; degrade gracefully above.

---

## 1) Status Update (As Of 2026-02-09)

Previously listed “confirmed breakpoints” are now resolved in code:

1. Detections endpoint wiring: client + server both use `GET /api/detections`.
2. Report export wiring: client downloads from `/api/reports/:id/export/pdf|text`.
3. Hardware `apiRequest(...)` usage: aligned with `apiRequest(method, url, data?)`.
4. Pests/insects rendering: `client/src/pages/Analysis.tsx` displays `analysis.pests`.
5. Device sensor reads write irrigation history: `POST /api/devices/:id/read` writes `sensor_readings` and logs.
6. Large image payload handling: server JSON limit raised (50mb) and 413 returns a friendly message; client compresses images.
7. Processing time measurement: `processingTimeMs` uses `Date.now() - processingStartTime`.

Additional stability fixes landed:
1. Express async route safety: async handlers are wrapped so rejections hit the error middleware.
2. Local dev auth: `DEV_DISABLE_AUTH=1` bypass is implemented (dev-only) and session cookies are not forced `secure: true` outside production.

---

## 2) Phase 1: FUNCTIONAL (Make Everything Work End-to-End)

This phase is about correctness and complete flows, not optimization.

### Milestone F1: Fix Wiring + Broken Flows

Deliverable: No broken endpoints from UI for the 3 priority modules.
Status: Implemented as of 2026-02-09 (run Acceptance tests to confirm end-to-end).

Tasks:
1. Fix detections endpoint usage:
   - Update `useAnimalDetections()` to call `GET /api/detections` (and invalidate the same key).
   - Optional: add `api.detections` definitions in `shared/routes.ts` so we stop hardcoding strings.

2. Fix report export URLs:
   - Update Analysis download buttons to hit:
     - `/api/reports/:id/export/text`
     - `/api/reports/:id/export/pdf`
   - Optional server compatibility route:
     - `GET /api/reports/:id/export?format=` can redirect to the correct endpoints.

3. Fix Hardware page API calls:
   - Replace incorrect `apiRequest(...)` usages with correct signature.
   - Verify CRUD works: discover, quick-connect, add, delete, test, capture, read.

Acceptance tests:
1. Go to `/deterrent` page: no errors; live activity list populates after simulation.
2. Go to `/analysis`, generate a report, click PDF/Text export: file downloads.
3. Go to `/hardware`, click Scan Devices, Quick Connect, Test, Read: no client errors.

### Milestone F2: Stabilize Image Analysis End-to-End

Deliverable: drone/camera image -> report created -> processed -> UI shows diseases + pests + actions + exports.
Status: Implemented as of 2026-02-09 (run Acceptance tests to confirm end-to-end).

Tasks:
1. Make uploads robust:
   - Increase server JSON body size limit in `server/index.ts` to handle real camera photos.
   - Add client-side resize/compress to reduce payload size:
     - `client/src/components/UploadZone.tsx`
     - `client/src/pages/Analysis.tsx` (file input path)
   - Add server-side “payload too large” friendly error message.

2. Fix processing time measurement:
   - Measure `processingStartTime = Date.now()` before OpenAI call.
   - Set `processingTimeMs = Date.now() - processingStartTime` after it returns.

3. Validate and normalize AI response:
   - Create a Zod schema for the expected analysis JSON structure.
   - On parse/validation failure:
     - store a safe fallback analysis
     - set report status to `failed` (or keep `complete` but explicitly set an error field)
     - show a “Retry analysis” button on the UI.

4. Complete UI rendering for pests:
   - Add a “Pests/Insects Found” block in `client/src/pages/Analysis.tsx`.
   - Farmer mode: short summary + top 1-3 pests + direct action steps.
   - Expert mode: show per-pest fields (confidence, category, lifestage, damageType, location).

Acceptance tests:
1. Upload a large phone image: analysis completes; no 413 errors.
2. A report that includes pests displays them on the UI.
3. Invalid AI response: UI shows a clear error + retry; app doesn’t crash.

### Milestone F3: Make Irrigation “Detection” Real

Deliverable: sensor readings (manual + device) produce consistent advice, are stored, and are visible in the Irrigation page and dashboard.
Status: Implemented as of 2026-02-09 (run Acceptance tests to confirm end-to-end).

Tasks:
1. Connect device sensor reads into the irrigation pipeline:
   - In `POST /api/devices/:id/read`:
     - compute irrigation advice using the same logic as `POST /api/irrigation`
     - write to `sensor_readings` via storage
     - create an activity log entry with details + metadata

2. Add irrigation settings UI:
   - Server already provides:
     - `GET /api/irrigation/settings`
     - `PATCH /api/irrigation/settings`
   - Add client hooks and UI in `client/src/pages/Irrigation.tsx`:
     - toggle active
     - moisture threshold slider/input
     - manual override

3. Define and implement “irrigation detection” behavior:
   - If `isActive && !manualOverride && soilMoisture < threshold`:
     - create a high-visibility activity log entry
     - show a visible alert badge on dashboard (not just a decorative status card)

Acceptance tests:
1. Hardware “Read Sensor” adds a new irrigation history point.
2. Changing threshold changes advice and “needs irrigation” status.
3. Activity logs show irrigation events and contain useful metadata.

### Milestone F4: Make Audio Deterrent Truly Operational

Deliverable: wildlife detection -> auto rules -> deterrent activation -> logs + UI + optional sound output.
Status: Implemented as of 2026-02-09 (run Acceptance tests to confirm end-to-end).

Tasks:
1. Fix detections endpoint mismatch (from F1) so UI can see detections.

2. Full settings controls on Deterrent page:
   - Use existing endpoints:
     - `GET /api/deterrent/settings`
     - `PATCH /api/deterrent/settings`
   - Add controls for:
     - `volume` (0-100)
     - `soundType`
     - `activationDistance`
     - `autoActivate`

3. Make activation logic consistent:
   - Ensure both code paths use the same rule:
     - manual `/api/detections` creation
     - automated `/api/detections/simulate-camera`
     - drone image wildlife auto-trigger in report processing
   - Only show “Deterrent triggered” if:
     - `settings.isEnabled && settings.autoActivate && distance <= activationDistance`

4. Add real audio output (browser-mode) for true end-to-end:
   - Use Web Audio to generate a tone at the recommended frequency.
   - Requires user interaction: add an “Enable sound output” toggle (autoplay policy safe).
   - Use the server event feed (polling initially) to trigger sound when a new “deterred” detection appears.

5. Fix schema types for distance (resolved):
   - `audioRequestSchema.distance` uses `z.coerce.number()` for consistent math.

Acceptance tests:
1. Turn system on, simulate camera detection: deterrent triggers when within range.
2. UI shows detection with deterrentActivated=true and logs record the event.
3. If “Enable sound output” is on, the browser plays a tone on activation.

---

## 3) Phase 2: FAST (Make It Responsive and Efficient)

Only start after Phase 1 acceptance tests are green.

### Milestone P1: Reduce AI Payload + Latency
1. Enforce client-side resize/compression always (not optional).
2. Add server-side guardrails:
   - reject extremely large base64 data URLs with clear error
3. Concurrency limiting on OpenAI calls:
   - prevent server overload from simultaneous analyses
4. Consider async processing:
   - `POST /api/reports/:id/process` returns 202 + job id
   - polling/SSE to update UI

### Milestone P2: Reduce Polling Load + Improve Real-Time
1. Replace 5s polling for detections with SSE or WebSocket.
2. Back off polling when tab is hidden.
3. Paginate big lists:
   - `/api/reports`, `/api/logs`, `/api/detections`

### Milestone P3: Database Performance
1. Add indexes on:
   - created_at columns for `reports`, `sensor_readings`, `animal_detections`, `activity_logs`
2. Ensure top feeds are ordered with indexed columns.
3. Add “last N” endpoints for dashboard to avoid loading full history.

Performance acceptance tests:
1. Dashboard loads quickly with large datasets (1000+ rows).
2. Detection feed remains responsive without heavy polling.

---

## 4) Phase 3: FANCY (Polish Without Breaking Functional/Fast)

### Milestone U1: UX Clarity
1. Analysis:
   - progress stepper: Uploading -> Processing -> Complete
   - retry analysis button on failure
   - more explicit “pests vs diseases vs wildlife” sections
2. Irrigation:
   - “needs irrigation” alert banner
   - last sensor reading card + trend sparkline
3. Deterrent:
   - “quiet hours” / schedule option
   - event feed: “Detected -> Deterred -> Left”

### Milestone U2: i18n Coverage
1. Remove hardcoded English UI strings:
   - e.g., `client/src/components/UploadZone.tsx`
2. Ensure new UI additions use `useLanguage().t(...)`.

### Milestone U3: Visual Polish
1. Keep “Soul Forest” aesthetic consistent.
2. Add subtle motion only where it improves comprehension (not decoration).

---

## 5) Cross-Cutting Stabilization (Do Alongside All Phases)

### 5.1 Observability / Debuggability
1. Add a lightweight health endpoint: `GET /api/health`
   - DB connectivity check
   - build/version info
2. Standardize error response shape `{ message, code?, details? }`.
3. Add structured metadata to activity logs for key actions.

### 5.2 Auth/Dev Environment (Optional, but often the cause of “it works sometimes”)
Auth uses secure cookies in production in `server/replit_integrations/auth/replitAuth.ts`.
If you run locally over plain HTTP, OIDC callback + session persistence can still be tricky depending on your domain/https setup.

Status as of 2026-02-09:
1. Session cookie `secure` is conditional (only forced in production).
2. `DEV_DISABLE_AUTH=1` bypass exists for local testing (guarded to `NODE_ENV != production`).

Acceptance test:
- Local dev can login and retain session; or dev bypass works safely only in dev.

---

## 6) Suggested Sequencing (To Maximize Momentum)
1. F1 (wiring fixes) first: it unlocks everything else.
2. F2 (analysis stability + pests UI + exports) next.
3. F3 (irrigation from device -> DB -> UI) next.
4. F4 (deterrent settings + real audio + consistent activation) next.
5. Then performance milestones P1-P3.
6. Then polish milestones U1-U3.

---

## 7) Test Checklist (Manual + Simple Automated)

Manual smoke test (every time before “done”):
1. Login works and API calls return 200 (no silent 401 loops).
2. Analysis:
   - upload
   - process
   - pests/diseases render
   - export works
3. Irrigation:
   - calculate advice
   - history updates
   - device read creates history
   - threshold changes behavior
4. Deterrent:
   - enable system
   - simulate camera
   - detection appears
   - deterrent triggers correctly within range
   - audio plays if enabled (user-initiated)

Automated (lightweight) ideas:
- Add a small set of route-level tests for the three modules (supertest).
- Add a lint/check CI step: `npm run check`.
