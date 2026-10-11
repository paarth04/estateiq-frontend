# EstateIQ — Proposed API Contract (frontend-derived)

> Derived from how the frontend **consumes** data today (see `docs/frontend/data-mock.md`). This is a
> **proposal** for the FastAPI backend — names follow the schema in `CLAUDE.md` where one exists.
> Conventions: JSON, `snake_case` on the wire (the frontend will map to its camelCase types), ISO-8601
> timestamps in UTC, UUID ids, money in **lakh** as a number (the UI formats ₹ L / Cr), phone as E.164
> `"+919876543210"` (UI displays `+91 98765 43210`). Admin endpoints require `Authorization: Bearer <JWT>`.
> Items marked **⚠ CONFIRM** must be agreed before wiring.

---

## 0. Confirm-with-backend checklist

| # | Item | Frontend assumption today |
|---|---|---|
| C1 | **Sentiment labels (3-class)** — model classes → UI labels | UI: Positive / Neutral / Negative. Placeholder model classes: "Enthusiastic / Positive", "Neutral", "Frustrated / Hesitant / Negative" (`SENTIMENT_MODEL_CLASS`) |
| C2 | **Intent labels (6-class)** | Buy, Rent, Invest, Schedule visit, Info, Other |
| C3 | **Score scale + band thresholds** | 0–100; Hot ≥ 75, Warm 40–74, Cold < 40 |
| C4 | **Sentiment low-confidence threshold** | 0.6 |
| C5 | **"Follow-up pending" rule** | status = contacted AND no activity for ≥ 3 days |
| C6 | **Lead status enum** (6 values vs schema's 4) | `not_contacted, contacted, call_back, visit_scheduled, converted, lost` — needs migration of `leads.status` (`new` → `not_contacted`) |
| C7 | `lost_reason` vocabulary | not collected by UI yet |
| C8 | Provisional score marker | `label_source: "heuristic" \| "model"` on `lead_scores` |
| C9 | NER span format for transcript highlighting | exact span strings per call (or char offsets per turn) |
| C10 | Priority-calls urgency formula (server or client?) | client formula, see admin.md §3.3 |

---

## 1. Auth (admin only)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ "email": "admin@estateiq.in", "password": "…" }` | `200 { "access_token": "jwt", "token_type": "bearer", "user": AdminUser }` · `401 { "detail": "invalid_credentials" }` |
| GET | `/auth/me` | — | `AdminUser` |
| PATCH | `/auth/me` | `{ "name": "Parth", "email": "admin@estateiq.in" }` | `AdminUser` |
| POST | `/auth/me/password` | `{ "current_password": "…", "new_password": "…" }` | `204` · `400 { "detail": "wrong_current_password" }` |
| POST | `/auth/logout` | — | `204` (optional; client also drops the token) |

```json
// AdminUser
{ "id": "uuid", "name": "Admin", "email": "admin@estateiq.in", "role": "admin", "created_at": "2026-10-01T09:00:00Z" }
```
Frontend rules to keep: no signup; password ≥ 8 chars with a letter + number; on 401 anywhere → clear token → `/admin/login`.

## 2. Public (no auth) — landing page + call widget

| Method | Path | Purpose | Response |
|---|---|---|---|
| GET | `/public/projects` | Landing grid + dialog | `PublicProject[]` (includes non-sold properties) |
| POST | `/public/call-sessions` | Call widget "Start call" — creates/links client by phone and returns what the Vapi Web SDK needs **(VERIFY with Vapi integration)** | `201 { "session_id": "uuid", "vapi": { "assistant_id": "…", "public_key": "…", "metadata": { "session_id": "uuid" } } }` |
| POST | `/calls` | **Vapi webhook** (server-to-server, per CLAUDE.md): transcript + duration + metadata → find-or-create client by phone, create lead + call, run NER → sentiment/intent → score | `201 { "lead_id": "uuid", "call_id": "uuid" }` |

```json
// POST /public/call-sessions request (from CallWidget form)
{ "name": "Rahul Deshpande", "phone": "+919876543210", "consent": true, "project_id": "uuid-or-null" }
// 422 if phone !~ ^\+91[6-9]\d{9}$ or consent !== true
```
```json
// PublicProject — NEVER include score/sentiment/intent/leads
{
  "id": "uuid", "name": "Skyline Heights", "city": "Nashik", "locality": "Gangapur Road",
  "status": "Under construction", "total_units": 48, "available_units": 12,
  "description": "…", "image_url": "https://…/skyline-heights.jpg",
  "features": ["Clubhouse", "Gym"],
  "price_min_lakh": 65, "price_max_lakh": 185, "bhk_min": 2, "bhk_max": 4,
  "properties": [ Property ]
}
```

## 3. Leads

### GET `/leads` — Leads table, Dashboard lists, drawers
Query: `q` (name or phone digits) · `city` · `project_id` · `status` (repeatable) · `band` (Hot|Warm|Cold) · `score_min` · `score_max` · `intent` · `sentiment` · `created_from` · `created_to` · `called_from` · `called_to` · `sort` (`-last_call_at` default, `-score`, `created_at`) · `page` (1) · `page_size` (20).
```json
{
  "items": [ LeadListItem ], "total": 180, "page": 1, "page_size": 20,
  "counts_by_band": { "Hot": 43, "Warm": 104, "Cold": 33 }      // for the All/Hot/Warm/Cold tab counts
}
```
```json
// LeadListItem
{
  "id": "uuid", "client": { "id": "uuid", "name": "Priya Kulkarni", "phone": "+919876543210" },
  "project": { "id": "uuid", "name": "Baner Greens", "city": "Pune", "locality": "Baner" },
  "status": "not_contacted", "status_changed_at": "…", "last_activity_at": "…",
  "score": 86, "band": "Hot", "label_source": "heuristic",
  "sentiment": { "label": "Positive", "confidence": 0.82 },   // latest call
  "intent": "Schedule visit",                                  // latest call
  "budget_lakh": 95,                                           // null = not mentioned
  "created_at": "…", "last_call_at": "…", "calls_count": 2
}
```

### GET `/leads/{id}` — Lead Detail page + row-expand card
```json
{
  ...LeadListItem,
  "lost_reason": null,
  "details": {                                   // lead_features (NER) — nulls render "Not mentioned"
    "bhk": "2 BHK", "budget_lakh": 95, "city": "Pune", "locality": "Aundh",
    "property_type": "Apartment", "amenities": ["Clubhouse", "Gym"], "furnishing": null
  },
  "score_detail": {                              // lead_scores
    "score": 86, "band": "Hot", "model_version": "lead-score-v1", "label_source": "heuristic",
    "scored_at": "…",
    "shap": [ { "feature": "intent=schedule_visit", "label": "Asked to visit", "value": 12.0 } ]   // top 5 by |value|, humanized label from backend
  },
  "other_leads_same_phone": [ { "id": "uuid", "project": "Hill Crest", "created_at": "…" } ]
}
```

### PATCH `/leads/{id}` — inline status dropdown, "Mark contacted", Undo
```json
{ "status": "contacted", "lost_reason": null }      // lost_reason required when status = "lost" (⚠ C7)
→ 200 LeadListItem   (server sets status_changed_at / last_activity_at)
```

### GET `/leads/{id}/calls` — Calls blocks on Lead Detail
```json
[
  {
    "id": "uuid", "started_at": "…", "duration_seconds": 312,
    "sentiment": { "label": "Positive", "confidence": 0.82, "model_version": "sentiment-v0.3" },
    "intent": "Schedule visit",
    "transcript": [ { "who": "client", "text": "Hello, mujhe Hill Crest ke baare mein…", "lang": "en-IN" },
                    { "who": "agent",  "text": "Namaste! …", "lang": "en-IN" } ],
    "entities": [ "Hill Crest", "2 BHK", "97 lakh" ],          // ⚠ C9 (or [{turn, start, end, type}])
    "call_metadata": { "vapi_call_id": "…", "ended_reason": "customer-ended-call",
                       "tool_calls": [ { "name": "searchProperties", "args": { … } } ] },
    "processing": false                                       // true until NER/sentiment/score finish → UI "Processing…"
  }
]
```

### POST `/leads/{id}/score-feedback` — "This score looks right / wrong"
```json
{ "verdict": "wrong", "direction": "too_high" }   // direction only when wrong: "too_high" | "too_low"
→ 201 { "id": "uuid" }
```

### GET `/leads/priority?city=&limit=8` — Today's priority calls (optional; else client computes)
`→ [ { ...LeadListItem, "urgency": 92.4, "reasons": ["Hot", "not contacted yet", "asked to visit", "called 2h ago"] } ]` (⚠ C10)

## 4. Projects & properties (admin CRUD)

| Method | Path | Body → Response |
|---|---|---|
| GET | `/projects` | → `Project[]` (with `properties_count`, derived price/BHK ranges) |
| POST | `/projects` | `ProjectInput` → `201 Project` |
| GET | `/projects/{id}` | → `Project` + `properties: Property[]` |
| PATCH | `/projects/{id}` | partial `ProjectInput` → `Project` |
| DELETE | `/projects/{id}` | → `204` (cascades properties; ⚠ decide what happens to leads referencing it) |
| GET | `/projects/{id}/properties` | → `Property[]` |
| POST | `/projects/{id}/properties` | `PropertyInput` → `201 Property` |
| PATCH | `/properties/{id}` | partial `PropertyInput` → `Property` |
| DELETE | `/properties/{id}` | → `204` |

```json
// ProjectInput (form fields)
{ "name": "Skyline Heights", "city": "Nashik", "locality": "Gangapur Road", "status": "Under construction",
  "total_units": 48, "available_units": 12, "description": "…", "image_url": "https://…", "features": ["Clubhouse"] }
// PropertyInput (form fields)
{ "property_type": "Apartment", "bhk": 3, "price_lakh": 110, "bedrooms": 3, "bathrooms": 3,
  "area_sqft": 1350, "furnishing": "Semi-furnished", "status": "available",
  "features": ["Clubhouse", "Corner unit"], "image_url": "https://…" }
// Validation mirrored from the UI: total_units ≥ 1; available_units ≤ total_units; bhk 1–10 (null for Plot);
// price_lakh > 0; area_sqft ≥ 100; bedrooms/bathrooms ≥ 0 (0 for Plot).
```
Maps to `projects` / `properties` tables (`properties.features` JSONB; add `area_sqft`, `furnishing`, `image_url`, `property_type`, `bhk`, `price` as lakh or rupees — ⚠ decide unit).

### POST `/uploads/images` — image field
`multipart/form-data` `file` (image/*, max size TBD) → `201 { "url": "https://cdn…/abc.jpg" }`. The frontend then sends `image_url` in the project/property body. Replace the data-URL logic in `ImageField` (`src/admin/catalogForms.tsx`).

## 5. Analytics

Common query: `range` (`today|7d|30d`) or `from`/`to`, `city`, `project_id`.

| Method | Path | Feeds | Response |
|---|---|---|---|
| GET | `/analytics/kpis` | Dashboard KPI cards | `{ current: Kpis, previous: Kpis }` |
| GET | `/analytics/timeseries?metric=calls\|conversion\|sentiment&bucket=hour\|day\|week` | Calls over time, Conversion trend, Sentiment trend | `[ { "bucket_start": "…", "value": 12 } ]` / sentiment: `{ positive, neutral, negative }` shares |
| GET | `/analytics/breakdown?dimension=…` | every bar/donut | `[ { "key": "Baner", "count": 12, "converted": 3, "rate": 25.0 } ]` |
| GET | `/analytics/activity?limit=8` | Recent activity feed | `[ { "type": "call" \| "sentiment_shift" \| "status_change", "at": "…", "lead_id", "lead_name", "project", "duration_seconds?", "from?", "to?" } ]` |
| GET | `/analytics/export.csv` | Export CSV | CSV with the columns listed in admin.md §7 |

`dimension` values: `city` (+ target `{ "Nashik": 60, "Pune": 40 }`), `project`, `intent`, `sentiment`, `budget_band` (`<50`, `50-100`, `>100`, `not_mentioned`), `bhk`, `locality`, `amenity` (count every mention), `status_funnel` (stage reached), `band_conversion`, `project_conversion`, `score_band_conversion` (`<40, 40-59, 60-74, 75-89, 90+`).

```json
// Kpis
{ "total_enquiries": 61, "leads": 35, "conversion_rate": 0.086, "avg_call_seconds": 269,
  "hot": 14, "warm": 20, "cold": 1, "visit_requests": 8, "hot_not_contacted": 7,
  "follow_up_pending": 64 }   // follow_up_pending is "right now", not range-bound (⚠ C5)
```
Drill-downs ("View all", chart clicks) reuse `GET /leads` with the matching filters.

## 6. Settings
Theme, reduce-motion, default range and start page are **client-only preferences** (localStorage) — no endpoint required. Optional: `GET/PUT /me/preferences` `{ "default_range": "7d", "start_page": "/admin" }` to sync across devices. Org settings from DESIGN §11.9 (band thresholds, confidence threshold) would be `GET/PUT /settings` — ⚠ C3/C4.

---

## 7. Integration map (UI feature → data → endpoint → mock to replace)

| UI feature | Data needed | Endpoint | Replace this mock |
|---|---|---|---|
| Admin login / guard | token + user | `POST /auth/login`, `GET /auth/me` | `src/admin/auth.ts` `login`, `useAdminSession`, `DEMO_ADMIN` |
| Settings → profile / password | user, password change | `PATCH /auth/me`, `POST /auth/me/password` | `auth.ts` `updateProfile`, `changePassword` (plaintext mock account!) |
| Log out | — | `POST /auth/logout` (opt.) | `auth.ts` `logout` |
| Landing project grid + dialog + PropertyCards | public projects + properties | `GET /public/projects` | `src/api/catalog.ts` `useCatalog` (landing side) |
| Call widget Start call | session for Vapi | `POST /public/call-sessions` + Vapi SDK | timers in `CallWidget.tsx` |
| Lead creation after a call | transcript, duration, metadata | `POST /calls` (webhook) | `LEADS` generator |
| Dashboard KPIs + deltas | aggregates | `GET /analytics/kpis` | `metrics()` in `Overview.tsx` |
| KPI previews / View-all drawer | lead lists | `GET /leads?…` | `cur.lists.*`, `followUpList` |
| Today's priority calls | ranked not-contacted leads | `GET /leads/priority` or `GET /leads?status=not_contacted` + client `urgency()` | `PriorityCalls` |
| Mark contacted / status dropdown / Undo | status write | `PATCH /leads/{id}` | `setLeadStatus` |
| Calls over time, intent/sentiment split, activity | aggregates | `GET /analytics/timeseries`, `/breakdown`, `/activity` | Overview chart helpers |
| Leads table (search, filters, tabs, pagination) | paged leads | `GET /leads` | `Leads.tsx` client-side filter/sort/paginate |
| Row expand card | lead + latest call + NER | `GET /leads/{id}` | `leadInsights()` |
| Lead Detail calls + transcript + metadata | calls | `GET /leads/{id}/calls` | `callTranscript()` |
| Sentiment / intent chips | label + confidence + model_version | in lead/call payloads | `AdminCall.sentiment/confidence/intent` |
| Score badge + Why this score (SHAP) | score, band, shap, model_version, label_source, scored_at | `GET /leads/{id}` `score_detail` | `leadInsights().shap`, `MODELS` |
| Score feedback | verdict | `POST /leads/{id}/score-feedback` | local state in `WhyThisScore` |
| Projects list / detail | projects + properties | `GET /projects`, `GET /projects/{id}` | `catalog.ts` |
| Add/edit/delete project & property | CRUD | `POST/PATCH/DELETE /projects…`, `/properties…` | `saveProject`, `deleteProject`, `saveProperty`, `deleteProperty` |
| Image upload | file → URL | `POST /uploads/images` | `ImageField` data URL |
| Analytics charts (13) | aggregates | `GET /analytics/*` | computations in `Analytics.tsx` |
| Export CSV | rows | `GET /analytics/export.csv` (or keep client-side) | `exportCsv()` |
| Theme / reduce motion / prefs | local | none (or `/me/preferences`) | keep localStorage |
| Top-bar search | lead search | `GET /leads?q=` | **not implemented** |
| "Processing…" state for fresh calls | `processing` flag | in call/lead payload | `DataState kind="processing"` (unused today) |

## 8. Data the frontend must never receive on public endpoints
score, band, SHAP, sentiment, intent, lost_reason, other clients, internal notes, call metadata. Public payloads are `PublicProject` / `Property` only.
