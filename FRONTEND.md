# EstateIQ Frontend — Documentation Index

> **Single source of truth for the backend-integration phase.** Everything here was written by reading the
> code in `src/` (commit after "Settings page" work, Oct 2026). Anything not confirmed in code is marked
> **VERIFY**. Nothing in this file changes app behaviour.

| Doc | What it covers |
|---|---|
| **FRONTEND.md** (this file) | A) stack, running, config, folder tree, routing · F) mock vs real, limitations, TODOs |
| [docs/frontend/design-system.md](docs/frontend/design-system.md) | Every token (light + dark), fonts, motion, CSS utility classes, theme + reduced-motion handling |
| [docs/frontend/components.md](docs/frontend/components.md) | Every shared component: purpose, props, variants, states, animations; unused/legacy modules |
| [docs/frontend/client-landing.md](docs/frontend/client-landing.md) | B) Public landing page, section by section, and the Call-the-Agent widget (every state) |
| [docs/frontend/admin.md](docs/frontend/admin.md) | C) Admin: login, shell/sidebar, Dashboard, Leads/Calls, Lead Detail, Projects & properties, Analytics, Settings |
| [docs/frontend/data-mock.md](docs/frontend/data-mock.md) | D) Every mock entity as a TS interface, generators, stores, localStorage keys, derived rules |
| [API-CONTRACT.md](API-CONTRACT.md) | E) Proposed FastAPI endpoints with JSON shapes + the full UI → endpoint → mock-to-replace map |

---

## Product in one line (rev 3)

Two surfaces only:

| Surface | URL | Login | Who |
|---|---|---|---|
| **Public landing page** | `/` (also `/landing`) | none | Buyers. They press **Start call / Call the agent**, give name + mobile, talk to the AI voice agent → a **lead** is created. Clients have **no account**. |
| **Admin dashboard** | `/admin/*` | single **admin** login (mock) | The company. Full access. There is **no agent role** and **no client dashboard** (both removed in rev 3). |

Score, SHAP, sentiment and intent are **admin-only**; the public page never receives them.

---

## A1. Tech stack (exact versions from `package.json`)

| Area | Package | Version |
|---|---|---|
| UI | `react`, `react-dom` | 18.3.1 |
| Language | `typescript` | 5.5.4 (`strict`, `noUnusedLocals`, `noUnusedParameters`) |
| Build / dev server | `vite` + `@vitejs/plugin-react` | 5.4.8 / 4.3.1 |
| Routing | `react-router-dom` | 6.26.2 |
| Styling | `tailwindcss` (+ `postcss` 8.4.47, `autoprefixer` 10.4.20) | 3.4.17 |
| Class helpers | `clsx` 2.1.1, `tailwind-merge` 2.5.4 (`cn()` in `src/lib/utils.ts`) | |
| Animation | `motion` (Framer Motion, imported as `motion/react`) | 11.18.2 |
| Charts | `recharts` | 2.12.7 |
| Dialog / drawer | `@radix-ui/react-dialog` | 1.1.2 |
| Tabs + Select | `@base-ui/react` (HaloTabs, Leads status dropdown) | 1.8.0 |
| Globe | `cobe` (WebGL) | 2.0.1 |
| Carousel (legacy, unused) | `embla-carousel-react` / `-autoplay` | 8.3.0 |
| Icons | `lucide-react` | 0.439.0 |
| Data fetching | `@tanstack/react-query` | 5.56.2 — **provider mounted in `main.tsx`, but no screen uses it today** (see F) |
| Misc | `@radix-ui/react-use-controllable-state` 1.1.0 | (used by ported ui components) |

Fonts (Google Fonts, loaded in `index.html`): **Inter**, **Inter Tight** (display), **Noto Sans Devanagari** (transcripts / code-mixed text).

## A2. Running it

```bash
npm install
npm run dev        # Vite dev server — vite.config.ts sets port 5173 (we have also run it on 5174 with --port)
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # serve dist/
```

- Admin demo login: **`admin@estateiq.in` / `admin123`** (mock; editable in Settings — see admin.md).
- **Env / config flags: none.** There is no `.env`, and no `import.meta.env` usage in `src/`. Path alias `@` → `src/` (vite.config.ts + tsconfig `paths`).
- Gotcha seen in development: after adding a new dependency, a long-running dev server may serve a stale optimized-deps bundle (504 "Outdated Optimize Dep" → white screen). Fix: restart with `npx vite --force`.

## A3. Folder tree (every meaningful file)

```
estateiq-frontend/
├── index.html                 Root HTML. Pre-paint scripts: sets <html data-theme> (eq-theme / system) and
│                              <html data-reduced-motion> (eq-reduced-motion). Loads Google Fonts.
├── package.json / package-lock.json
├── vite.config.ts             React plugin, "@" alias, dev port 5173.
├── tailwind.config.js         Maps every token to Tailwind (colors, radius, fonts, fontSize, zIndex, durations, shadows).
├── postcss.config.js          tailwind + autoprefixer.
├── tsconfig.json              strict TS, "@/*" path.
├── CLAUDE.md                  Backend/schema/build-plan notes (backend side of the project).
├── README.md                  Project readme (pre-existing).
├── FRONTEND.md / API-CONTRACT.md / docs/frontend/*.md   ← this documentation
├── public/
│   ├── images/<slug>.jpg      6 project photos (placeholders; same filenames = real photos drop-in):
│   │                          skyline-heights, lake-vista, riverside-park, hill-crest, baner-greens, kharadi-vista
│   ├── images/hero-poster.jpg First frame of the hero video (instant paint / phones / reduced motion).
│   ├── images/transcript-texture.png   410×410 mostly-transparent linen tile behind transcripts.
│   └── videos/hero.mp4 (+README.txt)   15 s, 1280×720 stock skyline loop (placeholder footage).
└── src/
    ├── main.tsx               React root: <QueryClientProvider> + <BrowserRouter> + <App/>.
    ├── App.tsx                Top-level router: /admin/* → AdminRoutes; "/" + "/landing" → Landing; else → "/".
    ├── index.css              Tailwind layers + ALL custom CSS classes/keyframes (see design-system.md §5).
    ├── styles/tokens.css      Design tokens (light :root + [data-theme="dark"]).
    ├── lib/
    │   ├── utils.ts           cn() = clsx + tailwind-merge (custom font-size names registered).
    │   ├── theme.ts           useTheme(): light/dark/system, persisted (eq-theme), cross-component sync event.
    │   ├── motion.ts          App-aware useReducedMotion() (OS OR in-app switch), set/useForcedReducedMotion.
    │   └── AppMotion.tsx      <AppMotion> = MotionConfig honouring the in-app reduce-motion switch.
    ├── api/                   SHARED data layer (public + admin)
    │   ├── types.ts           All TS contracts (Project, Property, LeadStatus, EnquiryDetails, Lead, …).
    │   ├── status.ts          The 6-status vocabulary: labels, colours, order (STATUSES, STATUS_LABEL, statusMeta).
    │   ├── catalog.ts         LIVE projects+properties store (localStorage eq-catalog-v1) + CRUD + derived views.
    │   ├── mock.ts            Seed PROJECTS (6) + PROPERTIES (6); legacy client mocks (CLIENT, ENQUIRIES, api{}).
    │   └── hooks.ts           LEGACY react-query hooks over mock api (unused since client dashboard removal).
    ├── components/            Shared components (see components.md)
    │   ├── BrandMark, Button, Card, CityPill, ThemeToggle
    │   ├── ScoreBadge, StatusPill, SentimentChip, IntentChip, EnquiryDetailsCard, Transcript, WhyThisScore
    │   ├── PropertyCard       (used in landing project dialog)
    │   ├── DataState, FilterChip, ProjectCard   LEGACY / currently unused
    │   └── ui/                Ported 3rd-party UI: dialog (Radix), halo-tabs (Base UI), cutout-card, globe(+palettes),
    │                          carousel + loading-carousel (LEGACY, unused)
    ├── features/
    │   ├── landing/           Public site: Landing.tsx (navbar, hero, marquee, page), BelowFold.tsx (projects grid,
    │   │                      pillars, signals, at-a-glance, final CTA, footer), GlobeSection.tsx, ProjectCards.tsx,
    │   │                      HeroDoodles.tsx (BrushUnderline …), Doodles.tsx (ArrowDoodle …), useInView.ts
    │   └── client/CallWidget.tsx   The "Call the agent" widget (pill + consent/call dialog).
    └── admin/                 Admin interface
        ├── AdminRoutes.tsx    /admin routes + RequireAdmin guard + /admin/login.
        ├── AdminLayout.tsx    Shell: sidebar + sticky top bar (typewriter page title, search [unwired], theme, avatar).
        ├── AdminSidebar.tsx   Animated nav (layoutId pill), collapse rail, Log out + confirm.
        ├── nav.ts             NAV items (5).
        ├── auth.ts            MOCK auth: session + editable account (localStorage).
        ├── prefs.ts           Admin prefs: default dashboard range, start page after sign-in.
        ├── mock.ts            180 generated leads + calls, live lead store, insights (NER+SHAP), transcripts.
        ├── useChartColors.ts  Reads token colours for Recharts (re-reads on theme change).
        ├── catalogForms.tsx   Sheet (drawer), ConfirmDelete, Field, ChipPicker, ImageField, ProjectForm, PropertyForm.
        ├── components/        TypewriterTitle.tsx (looping title), Toast.tsx (useToast)
        └── screens/           AdminLogin, Overview (= "Dashboard"), Leads, LeadDetail, Projects, ProjectAdmin,
                               Analytics, Settings, Placeholder (LEGACY, unused)
```

## A4. Routing (complete)

Top level is decided **by path** in `src/App.tsx` (no role switch):

| Path | Renders | Auth | Notes |
|---|---|---|---|
| `/` | `Landing` | public | |
| `/landing` | `Landing` | public | alias |
| `/admin/login` | `AdminLogin` | public | if already signed in → redirects to the **start page** pref (default `/admin`) |
| `/admin` | `AdminLayout` → `Overview` (labelled **Dashboard**) | **RequireAdmin** | |
| `/admin/leads` | `Leads` | RequireAdmin | nav label "Leads / Calls" |
| `/admin/leads/:id` | `LeadDetail` | RequireAdmin | unknown id → "Lead not found" card |
| `/admin/projects` | `Projects` | RequireAdmin | |
| `/admin/projects/:id` | `ProjectAdmin` | RequireAdmin | unknown id → "Project not found" |
| `/admin/analytics` | `Analytics` | RequireAdmin | |
| `/admin/settings` | `Settings` | RequireAdmin | |
| `/admin/calls` | → redirect `/admin/leads` | | Calls merged into Leads |
| `/admin/ai-models` | → redirect `/admin` | | page removed |
| `/admin/users` | → redirect `/admin` | | page removed (single admin) |
| `/admin/*` (unknown) | → redirect `/admin` | | |
| anything else (`/home`, `/login`, `/enquiries`, …) | → redirect `/` | | old client-dashboard URLs |

**Guard (`RequireAdmin` in AdminRoutes.tsx):** no mock session → `<Navigate to="/admin/login" replace/>`.
After a successful sign-in the app **always** goes to the start-page preference (default `/admin`), not the
page that bounced you. Entry point to login on the public site: **footer → "Admin login"** (the navbar has no login).

---

## F. What's MOCK vs REAL — and integration TODOs

### F1. Real (works without a backend, keep)
- All UI, routing, guard, theming (light/dark/system), reduced-motion (OS + in-app), animations, charts, forms + validation.
- Client-side derived logic that should **move server-side or be confirmed** (see API-CONTRACT "confirm with backend").

### F2. Mocked (replace)

| Area | Mock today | File |
|---|---|---|
| Admin auth (login, session, profile, password) | localStorage `eq-admin-session`, `eq-admin-account`; demo creds | `src/admin/auth.ts` |
| Leads + calls | 180 seeded leads, fixed `NOW = 2026-10-11 18:00 IST`, in-memory store | `src/admin/mock.ts` |
| Lead status changes | in-memory `setLeadStatus` (lost on reload) | `src/admin/mock.ts` |
| NER extraction, SHAP, transcripts, call_metadata | deterministic per-lead generators | `src/admin/mock.ts` (`leadInsights`, `callTranscript`) |
| Score / sentiment / intent | generated fields on each lead | `src/admin/mock.ts` |
| Projects + properties CRUD | localStorage `eq-catalog-v1` seeded from `api/mock.ts` | `src/api/catalog.ts` |
| Image upload | file → **data URL** stored in catalog (≤1.5 MB) or a `/images/...` path | `src/admin/catalogForms.tsx` (`ImageField`) |
| Analytics aggregates | computed in the browser from the lead store | `Overview.tsx`, `Analytics.tsx` |
| Score feedback (Right/Wrong) | local component state only, not stored | `src/components/WhyThisScore.tsx` |
| "Mark contacted" undo, priority queue | client-side | `Overview.tsx` |
| Call widget call flow | timers fake "connecting → in call"; **no Vapi SDK**; no lead is created | `src/features/client/CallWidget.tsx` |
| Admin prefs | localStorage `eq-admin-prefs` (client-only is fine) | `src/admin/prefs.ts` |
| CSV export | built in the browser from current filter | `Analytics.tsx` |

### F3. Known limitations / TODOs for integration
1. **Status vocabulary mismatch:** frontend uses 6 statuses (`not_contacted, contacted, call_back, visit_scheduled, converted, lost`); CLAUDE.md schema has 4 (`new/contacted/converted/lost`). Backend needs a migration (or a mapping). `lost_reason` is not collected by the UI yet (the status dropdown sets `lost` with no reason prompt) — **TODO**.
2. **Sentiment / intent label sets are placeholders** — "confirm with backend" (3-class sentiment, 6-class intent).
3. **Score bands** (Hot ≥75, Warm 40–74, Cold <40), **sentiment confidence threshold** 0.6 and the **Follow-up pending** rule (status = contacted AND no activity ≥ 3 days) are hard-coded constants — confirm & ideally serve from backend settings.
4. **Provisional scores**: `MODELS.provisional = true` everywhere (cold-start heuristic). Needs `label_source` from the backend.
5. **Transcript ↔ NER spans:** highlighting uses exact substrings from mock; real NER should return character offsets or the exact span strings per turn.
6. **Top-bar search** (`AdminLayout`) is rendered but **not wired** to anything.
7. **Call widget** never calls an API; on "Start call" it only animates. Needs: create call session (Vapi), and the `POST /calls` webhook creates the lead server-side. **Failure / callback fallback states don't exist** (DESIGN §22.6) — TODO.
8. **Hero carousel/globe/stats + admin lead generator use the static seed project list**, not the live catalog — new projects added in admin appear in the landing grid + dialog only.
9. **Projects**: deleting a project in the admin does not touch leads that reference it (mock leads use seed projects).
10. **Images**: data URLs can exceed localStorage quota → in-tab-only save (a warning is shown). Real upload endpoint needed.
11. **Multiple leads per phone** ("Other leads from this number") is implemented but the mock never repeats a phone.
12. **No pagination/sorting server-side** — Leads paginates 20/page client-side over all leads.
13. **react-query** is installed + provided but unused; recommended to wrap the new API calls in it.
14. **Accessibility note:** the looping typewriter page title runs indefinitely (WCAG 2.2.2) unless reduced motion is on (OS or Settings). A pause control was suggested, not built.
15. **Legacy/unused code** kept in tree: `api/hooks.ts`, `CLIENT`/`ENQUIRIES`/`api{}` in `api/mock.ts`, `DataState`, `FilterChip`, `ProjectCard`, `ui/carousel`, `ui/loading-carousel`, `admin/screens/Placeholder`, `HouseCallDoodleAnimated`/`KeyDoodleAnimated`. Safe to delete or reuse (DataState is the intended loading/empty/error/processing component for real API states).
