# Data & Mock Layer

Two live stores + a few local prefs. Everything is in-browser; **nothing calls a server**.

| Store | File | Persistence | Consumers |
|---|---|---|---|
| **Lead store** (leads + calls) | `src/admin/mock.ts` (`LEADS`, `useLeads`, `setLeadStatus`) | **memory only** (status edits reset on reload) | Dashboard, Leads, Lead Detail, Analytics |
| **Catalog store** (projects + properties) | `src/api/catalog.ts` (`useCatalog`, `saveProject`, `deleteProject`, `saveProperty`, `deleteProperty`, `resetCatalog`) | `localStorage.eq-catalog-v1` (+ cross-tab `storage` sync) | Admin Projects pages, landing grid + dialog + PropertyCards |
| Admin session / account | `src/admin/auth.ts` | `eq-admin-session`, `eq-admin-account` | guard, login, Settings |
| Admin prefs | `src/admin/prefs.ts` | `eq-admin-prefs` | Dashboard default range, sign-in start page |
| Theme | `src/lib/theme.ts` | `eq-theme` (absent = system) | all |
| Reduce motion (app) | `src/lib/motion.ts` | `eq-reduced-motion` ("1"/"0") | all |
| Sidebar collapsed | `src/admin/AdminSidebar.tsx` | `eq-admin-sidebar-collapsed` | sidebar |

Stores use `useSyncExternalStore`; every `localStorage` access is wrapped in try/catch.

## 1. Enums & vocab (`src/api/types.ts`, `src/api/status.ts`, `src/admin/mock.ts`)

```ts
type City = "Nashik" | "Pune";
type LeadStatus = "not_contacted" | "contacted" | "call_back" | "visit_scheduled" | "converted" | "lost";
type ScoreBand = "Hot" | "Warm" | "Cold";                 // band(score): ≥75 Hot, ≥40 Warm, else Cold   ← CONFIRM WITH BACKEND
type SentimentLabel = "Positive" | "Neutral" | "Negative"; // 3-class UI labels                             ← CONFIRM WITH BACKEND
type IntentLabel = "Buy" | "Rent" | "Invest" | "Schedule visit" | "Info" | "Other"; // 6-class          ← CONFIRM WITH BACKEND
type PropertyType = "Apartment" | "Villa" | "Row house" | "Penthouse" | "Plot";
type Furnishing = "Unfurnished" | "Semi-furnished" | "Fully furnished";

SENTIMENT_CONFIDENCE_THRESHOLD = 0.6     // below → "low confidence" chip          ← CONFIRM
MODELS = { sentiment: "sentiment-v0.3 (mock)", scoring: "lead-score-heuristic-v0 (mock)", provisional: true }
NOW = 2026-10-11T18:00:00+05:30          // fixed clock for the mock — replace with Date.now()
```

## 2. Lead + Call (admin, `src/admin/mock.ts`)

```ts
interface AdminCall {
  id: string;            // "c12-0"
  at: number;            // epoch ms
  durationSec: number;   // 70–490
  sentiment: SentimentLabel;
  confidence: number;    // 0.42–0.98
  intent: IntentLabel;
}

interface AdminLead {
  id: string;            // "L1012"
  name: string;          // "Priya Kulkarni"
  phone: string;         // "+91 98765 43210"
  projectId: string;     // "p1"
  project: string;       // "Skyline Heights"
  city: City;
  locality: string;      // project locality, "Gangapur Road"
  score: number;         // 5–98
  band: ScoreBand;
  status: LeadStatus;
  sentiment: SentimentLabel;   // = latest call
  intent: IntentLabel;         // = latest call
  budgetLakh: number | null;   // null → "Not mentioned"
  createdAt: number;           // first call time
  lastActivityAt: number;      // max(statusChangedAt, last call)
  statusChangedAt: number;
  prevSentiment: SentimentLabel | null; // earlier call's sentiment if different (activity "shift")
  calls: AdminCall[];          // 1–3, ascending
}
```

**Generator** (seeded mulberry32, seed `20261011`, deterministic): 180 leads over the last 60 days (more recent = more leads); city 60/40 Nashik/Pune; intent weights Buy 34 · Schedule visit 20 · Info 18 · Invest 12 · Rent 10 · Other 6; sentiment Positive 45 · Neutral 35 · Negative 20; budget missing 18% (Pune ₹55–165 L, Nashik ₹32–127 L); `score = 14 + U·56` +18 (Buy/Visit) +10 (Positive) −15 (Negative) +6 (budget), clamped 5–98; status weighted by age (≤2 days mostly not_contacted); then a **conversion quota pass**: Hot 25% / Warm 10% / Cold 3% converted, applied separately to last-30-days and older leads (only settled ≥2-day leads). Current totals: Hot 43 · Warm 104 · Cold 33; Nashik ~117 · Pune ~63.

**Mutation:** `setLeadStatus(id, status)` → sets status, `statusChangedAt = lastActivityAt = now` (capped at NOW). Undo in priority calls = set back to `not_contacted`.

## 3. AI outputs per lead (`leadInsights(lead)`, `callTranscript(lead, i)`)

```ts
interface EnquiryDetails {          // NER → lead_features
  bhk: string | null;               // "2 BHK"
  budget: string | null;            // "₹ 65 L" | "₹ 1.2 Cr"
  city: string | null;              // "Pune"
  locality: string | null;          // project area ~55%, else another area in the city; null ~20%
  propertyType: string | null;      // "Apartment" | "Villa"
  amenities: string | null;         // comma-joined subset of project features: "Clubhouse, Gym"
  furnishing: string | null;
}
interface ShapItem { feature: string; label: string; value: number } // "intent=schedule_visit", "Asked to visit", +12
interface LeadInsights { details: EnquiryDetails; shap: ShapItem[] /* top 5 by |value| */; scoredAt: number }

interface TranscriptTurn { who: "client" | "agent"; text: string; lang?: string } // "en-IN" | "hi-IN"
interface CallTranscript {
  turns: TranscriptTurn[];          // client speaks first; Hinglish; one Devanagari line on positive calls
  highlights: string[];             // exact spans that fed EnquiryDetails (e.g. "Hill Crest", "2 BHK", "97 lakh")
  metadata: {                       // call_metadata
    vapi_call_id: string; ended_reason: "customer-ended-call" | "assistant-ended-call";
    language_detected: string;
    tool_calls: { name: "searchProperties" | "requestSiteVisit"; args: Record<string, unknown> }[];
    pipeline: { ner: "done"; sentiment: string; scoring: string };
  };
}
```
SHAP features used: `intent=*` (±5…+12), `sentiment=*` (+8 / −1 / −10), `budget_mentioned` (+7/+9 high) or `budget_mentioned=false` (−6), `num_calls>1` (+5), `property_type_specified` (+4) / `property_type_missing` (−3), `amenities_count` (+3), `city=*` (+1/+1.5). Mock values are **not** real SHAP.

Extraction areas: Nashik — Gangapur Road, College Road, Indira Nagar, Panchavati, Nashik Road, Satpur, CIDCO, Deolali Camp, Ashok Stambh. Pune — Baner, Aundh, Wakad, Hinjewadi, Kharadi, Viman Nagar, Kothrud, Hadapsar, Bavdhan.

## 4. Projects & properties (`src/api/types.ts`, seeded in `src/api/mock.ts`, live in `src/api/catalog.ts`)

```ts
interface Project {
  id: string;                 // "p1"
  name: string;               // "Skyline Heights"
  city: City;
  locality: string;           // "Gangapur Road"
  status: "Ready to move" | "Under construction" | "New launch";
  unitTypes: string;          // "2–3 BHK"  (DERIVED from properties when present)
  priceRange: string;         // "₹ 65 L – 1.4 Cr" (DERIVED from properties when present)
  features: string[];         // amenities
  totalUnits?: number;        // 48
  availableUnits?: number;    // 12
  description?: string;
  image?: string;             // "/images/skyline-heights.jpg" | data URL (mock upload)
}
interface Property {
  id: string;                 // "r1"
  projectId: string; project: string; city: City;    // denormalised from project
  type: string;               // display title "2 BHK" | "3 BHK Villa" | "Plot"
  price: string;              // display "₹ 1.1 Cr" (from priceLakh)
  beds: number; baths: number;
  tags: string[];             // amenities
  status?: "available" | "sold" | "hold";
  propertyType?: PropertyType;
  bhk?: number;
  priceLakh?: number;         // SOURCE OF TRUTH for price (110 → "₹ 1.1 Cr")
  areaSqft?: number;
  furnishing?: Furnishing;
  image?: string;
}
```
Seed projects (6): p1 Skyline Heights (Nashik, Gangapur Road), p2 Lake Vista (Nashik, Indira Nagar), p5 Riverside Park (Nashik, Panchavati), p6 Hill Crest (Nashik, Deolali Camp), p10 Baner Greens (Pune, Baner), p14 Kharadi Vista (Pune, Kharadi). Seed properties: 6 (r1–r6).

Derived (`projectView`): `priceRange` = min–max of properties' `priceLakh`; `unitTypes` = min–max BHK. `fmtLakh(110) = "₹ 1.1 Cr"`, `fmtLakh(65) = "₹ 65 L"`.

## 5. Admin account / session / prefs

```ts
interface AdminSession { email: string; name: string; at: number }          // eq-admin-session
interface Account { name: string; email: string; password: string }         // eq-admin-account (MOCK — plaintext!)
DEMO_ADMIN = { email: "admin@estateiq.in", password: "admin123", name: "Admin" }
interface AdminPrefs { defaultRange: "today" | "7d" | "30d"; startPage: "/admin" | "/admin/leads" | "/admin/analytics" } // eq-admin-prefs
```

## 6. Legacy client types (unused today)
`ClientEnquiry`, `ClientProfile`, `Lead`, `LeadScore { score, band, shapValues: {label,value}[], modelVersion, labelSource: "heuristic"|"model", scoredAt }`, `Sentiment { label, confidence, modelVersion }` in `api/types.ts`; `CLIENT`, `ENQUIRIES`, `api{}` in `api/mock.ts`. `LeadScore.labelSource` is the intended field for the **provisional** marker — reuse it.

## 7. Derived rules computed in the browser (move server-side or confirm)

| Rule | Definition | Where |
|---|---|---|
| Score band | ≥75 Hot, 40–74 Warm, <40 Cold | `band()` |
| Hot not contacted | band Hot AND status `not_contacted` | Overview `metrics()` |
| **Follow-up pending** | status `contacted` AND now − lastActivityAt ≥ 3 days | Overview |
| Conversion rate | converted ÷ leads created in window | Overview/Analytics |
| Priority urgency | formula in admin.md §3.3 | Overview `urgency()` |
| Low-confidence sentiment | confidence < 0.6 | SentimentChip |
| Provisional score | `MODELS.provisional` (all) | everywhere |
| Period deltas | same-length previous window | Overview |
