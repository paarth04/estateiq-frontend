# Admin Interface (`/admin/*`)

One role: **admin** (full access). All data below comes from the **mock** lead store (`admin/mock.ts`) and catalog store (`api/catalog.ts`) — see data-mock.md. Every screen reads the **same shared live state**, so a status change anywhere updates every count, chart and list immediately.

---

## 1. Login (`/admin/login`, `screens/AdminLogin.tsx`)
- Centred card: BrandMark, "Admin" tag, theme toggle (top-right), **Sign in** heading, "Company dashboard for the EstateIQ team."
- Fields: **Email \*** (`type=email`, `autocomplete=username`; errors "Enter your email." / "Enter a valid email address."), **Password \*** (show/hide eye toggle, `aria-pressed`; error "Enter your password."). Errors appear on blur and on submit; focus jumps to the first invalid field.
- Wrong credentials → alert box: "That email and password don't match an admin account."
- Success → navigate to **start page** pref (default `/admin`). Already signed in → redirected there too.
- Footer note: "Mock sign-in (no backend yet). Default demo account: admin@estateiq.in / admin123".
- **No signup** anywhere. Entry point from the public site: footer "Admin login".

## 2. Shell (`AdminLayout.tsx`, `AdminSidebar.tsx`, `nav.ts`)

### Sidebar
| Item | Route | Icon |
|---|---|---|
| Dashboard | `/admin` | LayoutDashboard |
| Leads / Calls | `/admin/leads` | Users |
| Projects & properties | `/admin/projects` | Building2 |
| Analytics | `/admin/analytics` | BarChart3 |
| Settings | `/admin/settings` | Settings |
- Top: BrandMark (wordmark hidden when collapsed) + orange **Admin** tag.
- **Active indicator:** a shared Framer `layoutId="admin-nav-pill"` (accent-soft fill + 2px orange left bar) glides between rows (spring bounce .2, .5 s); active icon/label `text-accent-ink`. Hover: row → surface-hover, icon nudges 2px. Icons 20px / 1.5 stroke.
- **Badges:** supported by `NavItem.badge` (accent-soft pill) — currently **none set** (Leads badge removed).
- **Collapse** (≥1024px): 240px ↔ 72px spring width; labels fade; tooltips on hover/focus when collapsed; persisted `eq-admin-sidebar-collapsed`. Below 1024px always the icon rail.
- **Keyboard:** ↑/↓/Home/End move between items; `aria-current="page"` on the active link.
- **Log out** (bottom) → confirm dialog "Log out? You'll need to sign in again…" (Cancel / Log out) → clears session → `/admin/login`.

### Top bar (sticky, `bg-bg/90` blur)
- **Page title** = current nav label, rendered with the looping **TypewriterTitle** (type 40 ms, hold 3.5 s, delete, retype; static under reduced motion).
- Search box "Search name or phone" — **UI only, not wired** (TODO).
- ThemeToggle; avatar circle "AD" (static, VERIFY: should show initials from profile).

---

## 3. Dashboard (`/admin`, `screens/Overview.tsx`)

### 3.1 Filters (one row)
- Left: **date range** HaloTabs pill — Today / 7d / 30d (default = Settings pref, initially **7d**) + "Mock data · compared with {yesterday | previous 7d | previous 30d}".
- Right: **city** HaloTabs — All / Nashik / Pune.
- Windows: Today = midnight→NOW (prev = the 24 h before); 7d/30d = rolling (prev = equal length before). Leads count by `createdAt`; calls by call time.

### 3.2 KPI cards — 3 per row, equal collapsed size

| Row | Card | Number = | Δ vs previous period | Click list ("leads behind it") |
|---|---|---|---|---|
| 1 | **Total Enquiries** | calls received in range | % | everyone who called in range |
| 1 | **Conversion rate** | converted ÷ leads created in range | percentage points | converted leads |
| 1 | **Avg. call duration** | mean call length (`Xm YYs`) | % | callers |
| 2 | **Hot leads** (red dot, "Score ≥ 75") | leads with band Hot | % | Hot leads |
| 2 | **Warm leads** ("Score 40–74") | | % | Warm |
| 2 | **Cold leads** ("Score < 40") | | % | Cold |
| 3 | **Visit requests** ("Intent = Schedule visit") | leads with intent Schedule visit | % | those leads |
| 3 | **Hot leads not contacted** (orange highlight) | band Hot AND status `not_contacted` | % (**up = bad**, shown red) | those leads |
| 3 | **Follow-up pending** ("Contacted, no activity in 3+ days · right now") | status `contacted` AND `NOW − lastActivityAt ≥ 3 days` (all time, city-filtered) | none | oldest activity first |

Δ colours: green = good, red = bad, grey = flat/none; "new" when the previous period was 0. Lists are sorted by score (desc) unless noted.

**Card anatomy:** label row (optional band dot) · big number + Δ · sub-line slot that is always present (2 lines reserved) so every collapsed card is the same height.

**Expand (click, Enter/Space; `role=button`, `aria-expanded`; one open at a time):**
1. The number (+Δ) **glides to the top-right corner** with a Framer `layout="position"` spring (bounce .2, .5 s) and scales to .78.
2. The label grows `text-small → text-h2` (semibold) and **types out** with a caret (38 ms/char), caret removed when done.
3. The preview springs open (grid-rows 0fr→1fr, `cubic-bezier(.34,1.56,.64,1)` .45 s): **top 3 leads** — name, project · city, Hot/Warm/Cold **type badge** (with score, provisional dot), and a compact **✓ Mark contacted** button for `not_contacted` leads. Rows fade/slide in staggered after ~280 ms. Then **View all (N) →**.
4. Hover: lift 2px + orange border + soft orange shadow; expanded: orange border + stronger shadow. Grid uses `items-start` + `self-start` so only the clicked card grows.
5. Reduced motion: number jumps, no typing, no transitions.

**View-all drawer (`LeadsDrawer`)** — right sheet (Radix: focus trap, Esc, scroll lock). Header "{metric} (count)", "Highest score first · select a lead to open it." Table: Client (name + +91 phone; row is a stretched link to Lead Detail), Project (+city), **Type** badge, Last call date, Action (**Mark contacted** for not-contacted, else status label). The drawer keeps a *selector* (not a snapshot) so it updates live; removed rows fade/slide out.

### 3.3 Today's priority calls (full width, under the KPIs)
- Header "Today's priority calls (N)", "Ranked by urgency · score, not-yet-contacted, recent call, intent, tone"; right side shows "Not yet contacted" or "Marked {name} as contacted · **Undo**".
- **Queue:** status `not_contacted` only, city-filtered (not range-filtered), **top 8** by urgency:
  ```
  urgency = score × 0.6
          + 25 if status = not_contacted
          + 12 if last call < 24h | + 8 if < 48h | + 3 if < 7 days
          + 8 if intent = Schedule visit | + 6 if intent = Buy
          + 4 if sentiment Positive | − 4 if Negative
  ```
- **Row:** rank (top 3 orange), name (stretched link → Lead Detail), project · city, type badge, "why" line in weight order (e.g. "Hot · not contacted yet · asked to visit · called 2h ago · positive tone"), **Call** (`tel:+91…`), **Mark contacted** (→ status `contacted`; row exits, next slides up; Undo restores `not_contacted`).
- Rows enter with 50 ms stagger; `layout` reflow. Footer link "View all leads →".

### 3.4 Charts + activity (left 2/3 stacked, right 1/3)
- **Calls over time** — area chart (accent, gradient), hourly for Today, daily otherwise.
- **Intent split** — horizontal bars, neutral ink-soft (intent is a category). Sub "6 labels — confirm with backend".
- **Sentiment split** — donut (positive/neutral/negative) + % legend; **click a slice → drawer** of those leads. Sub "Latest call · 3 labels — confirm with backend".
- **Recent activity** (right, full height) — latest 8 events in range: "New call from **{name}** · {project} · {duration}", "Sentiment shift for **{name}**: A → B", "**{name}** moved to **{Status}**", with relative time.
- Charts draw in on first visit only (never re-animate on filter change); tooltip/axes styled via tokens.
- (City split, Top projects, Budget, Status funnel and AI health were **moved/removed** from this page.)

---

## 4. Leads / Calls (`/admin/leads`, `screens/Leads.tsx`)

### Controls
- **Tabs** (lead type): All (n) · Hot (n) · Warm (n) · Cold (n) — HaloTabs; *this is* the lead-type filter.
- **Search**: name (case-insensitive) or phone digits (≥3 digits). One-box search (inner input has no ring; wrapper glows orange on focus).
- **Filters** (native selects; active → orange border): City · Project (grouped by city, limited to chosen city) · Status (6) · Score band (90–100, 75–89, 60–74, 40–59, Under 40). **Clear** button when any filter is active.
- "{n} leads match" (`aria-live`).

### Table (sticky header under the top bar on ≥lg; row hover)
| Column | Content |
|---|---|
| Client | ▾ chevron + name — a **button** (`aria-expanded`) toggling the row detail |
| Phone | `+91 XXXXX XXXXX` |
| Project · City | |
| Type | ScoreBadge type-only (Hot/Warm/Cold) |
| Status | **inline Status dropdown** (Base UI Select, themed popup with coloured dots, ✓ on current; keyboard: arrows/type-ahead/Esc) → `setLeadStatus` → shared state |
| Score | number + provisional dot |
| Last call | date |
| Created | date |
Sorted by last call (newest). **Pagination** 20/page with "1–20 of N", numbered pages with ellipses, prev/next. Filters reset to page 1. Empty: "No leads match these filters. Clear filters".

### Row expand (click anywhere on the row except the status control; one open at a time)
Full-width detail row, auto-height spring (`.eq-expand`), open row tinted accent-soft. Card (2 columns ≥lg):
- **Left:** name, mobile; Last call (date + time), Duration, Timestamp (ISO); chips: SentimentChip (confidence tooltip, low-confidence state), IntentChip, ScoreBadge (+type), Status dropdown; orange **View full lead →** button; note "Transcript, 'Why this score?' and call details are on the full lead."
- **Right:** `EnquiryDetailsCard` (BHK, budget ₹, city, locality, property type, amenities, furnishing; "Not mentioned" when missing) + "extracted from the call; missing fields are never guessed."

## 5. Lead Detail (`/admin/leads/:id`, `screens/LeadDetail.tsx`)
- "← All leads" link.
- **Header card:** name (h1), `tel:` mobile, project · locality, city; ScoreBadge (+type, provisional); Status dropdown (6).
- **Left column:**
  - **Enquiry details** card.
  - **Calls (n)** — one native `<details>` per call, newest first & open: header (Call N, date-time, duration, SentimentChip, IntentChip); body: "Timestamp {ISO} · highlighted words are what the AI extracted", **Transcript** (client first, Hinglish + some Devanagari, client labelled by first name, NER spans highlighted), collapsible **Technical details (call_metadata)** JSON (`vapi_call_id`, `ended_reason`, `language_detected`, `tool_calls[]` e.g. `searchProperties`, `requestSiteVisit`, `pipeline{}`).
- **Right column:**
  - **Why this score?** (WhyThisScore — summary typewriter → diverging SHAP bars, model version, scored time, provisional note, Right/Wrong → Too high/Too low feedback).
  - **Lead info:** Lead ID, Created, Source "Website call widget", Status + since date, Calls count; **Other leads from this number** (links) or "None — this is the only enquiry from {phone}."

## 6. Projects & properties (`/admin/projects`, `/admin/projects/:id`)

### List (`screens/Projects.tsx`)
"{n} projects · {n} properties · what you enter here is what clients see on the website." + **Add project**. Grouped **Nashik (n)** / **Pune (n)**; row: thumbnail, name (stretched link), locality, status chip, "{available} / {total} units", "{n} properties", price range (derived), chevron.

### Detail (`screens/ProjectAdmin.tsx`)
- Info card: cover image, CityPill + status chip, name, locality/city, **Edit**, **Delete** (confirm: removes project + its properties); facts Units / Homes (BHK range) / Price range / Properties; description ("No description yet."); amenity chips.
- **Properties (n)** + **Add property**; table: image thumb (or placeholder icon), title (e.g. "3 BHK Villa") + type, price (₹, Indian), beds·baths, area (sq ft), furnishing, amenities, status pill (Available green / On hold amber / Sold grey), ✎ edit, 🗑 delete (confirm). Empty state text.
- Warning banner if the last save couldn't be persisted (big image).

### Forms (right drawer `Sheet`, §23 patterns: label above, `*` required, errors on blur + submit, focus first error)
**Project:** Name\* · City\* (Nashik/Pune) · Locality\* · Status\* (New launch / Under construction / Ready to move) · Total units\* (int ≥1) · Available units (blank = all; ≤ total) · Description (shown to clients) · Amenities (chips: Clubhouse, Gym, Swimming pool, Covered parking, Kids' play area, Power backup, Security, Garden + custom) · Cover image.

**Property:** Property type\* (Apartment, Villa, Row house, Penthouse, Plot) · BHK\* (1–10; hidden for Plot) · Price in lakh\* (live hint "Shown to clients as ₹ 1.85 Cr") · Bedrooms\* · Bathrooms\* (hidden for Plot) · Area sq ft\* (≥100) · Furnishing (Unfurnished / Semi-furnished / Fully furnished; hidden for Plot) · Availability\* (Available / On hold / Sold) · Amenities (chips preset from the project's amenities + custom) · Property image. Header note "clients see this as '{title}' at {project}".

**Image field (MOCK):** **Choose file** (image/*, ≤1.5 MB → data URL preview) **or** a `/images/...` path; remove ✕; note "Mock image handling — files stay in this browser… Replace with a real upload when the backend is added." There is **no `imageService` module** — the seam is `ImageField.onChange(url)` → replace with an upload call returning a URL.

Client sync: the landing grid/dialog read the same store; price/BHK ranges derive from properties; sold properties hidden from "Available homes".

## 7. Analytics (`/admin/analytics`, `screens/Analytics.tsx`)
**Toolbar:** date range (Today/7d/**30d** default) + "Mock data · n leads · n calls"; **Project** select (filtered by city), **City** tabs (changing city clears project), **Export CSV** (one row per lead in filter: id, name, phone, city, project, extracted locality/BHK/budget/amenities, score, type, status, sentiment, intent, created, last call; UTF-8 BOM), **Print / PDF** (`window.print()`; toolbar hidden in print). All charts respect range + city + project.

| Section | Chart | Type & styling | Data | Click |
|---|---|---|---|---|
| Trends | **Enquiries over time** (wide) | Area, accent | calls per hour/day | |
| Trends | **Conversion rate trend** | Line, positive green, % axis | converted ÷ leads created per bucket (weekly for 30d) | |
| Trends | **Sentiment trend** (wide) | 100% stacked area pos/neu/neg + legend | share of calls per bucket | |
| Trends | **City split** | Donut 16px ring + faint 60/40 target ring, centre % Nashik | leads by city | slice → drawer |
| Performance | **Status funnel** | Horizontal bars: All leads (ink) → Contacted (cold) → Visit scheduled (accent) → Converted (green); Lost (red) | stage reached | |
| Performance | **Conversion by project** | Horizontal bars, accent, sorted desc | % converted per project | bar → converted leads |
| Performance | **Conversion by lead type** | Columns hot/warm/cold colours, % labels | % converted per band | column → band leads |
| Performance | **Score vs outcome** (full width) | Columns per score band (<40, 40–59, 60–74, 75–89, 90+) | % converted; **takeaway sentence** computed (75+ vs <60), wording flips if the score stops separating outcomes | |
| Demand | **Top projects by enquiries** | Horizontal bars, **outline-only** (1px orange stroke, transparent) → fills orange on hover / keyboard | leads per project | bar → drawer |
| Demand | **Budget distribution** | Columns <₹50L, ₹50L–1Cr, >₹1Cr + muted "Not mentioned" | extracted budget | |
| Demand | **BHK demand** | Columns, **outline-only → fill on hover** | extracted BHK | column → drawer |
| Demand | **Top localities requested** | Horizontal bars top 10, accent | extracted locality | bar → drawer |
| Demand | **Most requested amenities** | Horizontal bars top 10, **outline-only → fill on hover** (each mention counts) | extracted amenities | bar → drawer |
Notes "Extracted from call transcripts." on NER charts; "confirm with backend" on label-based charts. Draw-in once; tooltips show counts ("x% of n leads").

## 8. Settings (`/admin/settings`, `screens/Settings.tsx`)
1. **Account** — "Signed in as Admin · email". **Profile**: Name\*, Email\* (valid) → **Save profile** → updates mock account + session → toast "Profile saved." **Change password** (labelled mock): Current\*, New\* (≥8, letter + number, ≠ current), Confirm\* (must match); show/hide; wrong current → "Your current password isn't right."; success toast "Password updated (mock)." New credentials are used at next sign-in.
2. **Appearance & preferences** — **Theme** Light / Dark / System (instant, synced with top-bar toggle, toast). **Reduce motion** switch (`role="switch"`) → forces reduced motion app-wide (admin + landing). **Default dashboard date range** Today/7d/30d and **Start page after sign-in** (Dashboard / Leads / Analytics) → **Save preferences** (toast).
3. **Log out** — red-tinted card, button → confirm → clears session → `/admin/login`.

## 9. Removed pages (redirects)
`/admin/calls` → Leads; `/admin/ai-models`, `/admin/users` → Dashboard. **There is no Users page** (single admin). Model health/retraining (§11.7) has no screen now; model versions appear on the SHAP panel only.
