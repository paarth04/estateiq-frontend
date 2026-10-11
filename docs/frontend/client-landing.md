# Client Interface — Public Landing Page (`/`)

Rev 3: this page **is** the entire client experience. No client login, signup or dashboard. Journey: **land → Start call → name + mobile + consent → talk to the AI agent** → the backend creates the lead.

Files: `features/landing/Landing.tsx` (page, navbar, hero, projects marquee), `BelowFold.tsx` (lazy), `GlobeSection.tsx` (lazy), `ProjectCards.tsx`, `HeroDoodles.tsx`, `Doodles.tsx`, `useInView.ts`, `features/client/CallWidget.tsx`.

## Page order

| # | Section | Component | Theme band | Anchor |
|---|---|---|---|---|
| 0 | Skip link ("Skip to content" → `#main`) | `Landing` | | |
| 1 | Floating pill navbar | `Navbar` | adapts | |
| 2 | Full-bleed video hero | `Hero` | always dark (scrim) | `#hero-title` |
| 3 | Projects marquee | `ProjectMarquee` | page theme | |
| 4 | "Where we are" globe | `GlobeSection` (lazy) | always dark | |
| 5 | "Our projects" grid + detail dialog | `ProjectsGrid` → `ProjectCutoutGrid` | page theme | `#projects` |
| 6 | "How it works" pillars | `Pillars` | page theme | |
| 7 | "Signals" marquee | `Signals` | always dark | |
| 8 | "At a glance" bento (incl. "Why EstateIQ") | `AtAGlance` | page theme | `#about` |
| 9 | Final CTA | `FinalCta` | page theme | |
| 10 | Footer (incl. **Admin login**) | `Footer` | always dark | |
| — | Call-the-Agent widget (floating pill + dialog) | `CallWidget` | page theme | |

Code-splitting: sections 4–10 load lazily (`Suspense` fallback = full-height `aria-busy` div); the cobe/WebGL globe is a further lazy chunk.

---

## 1. Navbar (`Navbar`)
- `fixed top-3`, centred floating pill (max-w-5xl), `z-sticky-nav`, intro: slides/fades in.
- **Content:** BrandMark (link to `/`) · centre links **About** (`#about`), **Projects** (`#projects`) (md+) · ThemeToggle · **Call the agent** (orange pill, phone icon) → opens the widget · mobile **Menu** button (`aria-expanded`) → dropdown with Projects / About.
- **No Login link** (removed — the only login entry is the footer).
- **Adaptive theme:** `useNavOverDark()` checks whether the bar overlaps any `[data-nav-theme="dark"]` section (hero, globe, signals, footer) and switches to its dark style.

## 2. Hero (`Hero`)
- **Media:** `/videos/hero.mp4` (looped, muted, `playsInline`, `aria-hidden`) over `/images/hero-poster.jpg`. The video is **mounted only when** the hero is in view, viewport ≥ 640px and no reduced motion; it pauses off-screen; on error falls back to the poster. Alt (for poster): *"Aerial view of a city skyline and riverside towers at sunset (stock footage)"*. Overlay: `scrim/60 → scrim/20` gradient.
- **Headline** (`h1`, `text-display` / `md:text-display-lg`, aria-label = full sentence):
  - Line 1: "Find your **_Real Estate_** with" — *Real Estate* italic, `text-accent-ink` (orange); hover → scale 1.08 + wobble (off under reduced motion).
  - Line 2: "**_One Call_**." — italic, ink (white on the dark hero) with an animated orange **BrushUnderline**.
  - Intro: words rise one by one (timeline `T`: words start 0.25 s, 0.06 s gap).
- **Subtext:** looping **Typewriter**: *"Talk to our property assistant about real estate projects across Nashik and Pune. No forms, just a call."* (35 ms/char type, 15 ms delete, 1.5 s hold, 0.4 s gap, orange caret; fixed height; static under reduced motion).
- **CTAs:** **Start call** — ghost pill with glowing orange edge (`.eq-glow-edge`), phone icon wiggles on hover, lifts 2px → opens widget. **View projects** → `#projects` (ghost pill, arrow).
- **Feature strip** (3 bracket-framed chips, `.eq-bracket` corners, `bg-scrim/50`): "Just a call — No forms. Talk to our AI agent and get matched." · "Understood instantly — Your BHK, budget and area, captured from the conversation." · "No audio stored — We keep only a text transcript of your call."
- The **3D house** and older choreography (blobs, doodles) were **removed** — VERIFY none needed.
- Responsive: buttons stack on phones; feature chips 1 → 3 columns.

## 3. Projects marquee (`ProjectMarquee`)
- Full-bleed row of 6 project photos (`/images/<slug>.jpg`, 320px / 384px wide, 2:1) with captions "Name · Locality · City" (from seed `PROJECTS`), duplicated for a seamless loop (`translateX 0 → −50%`, 50 s linear).
- **Click the row to pause/resume** (not hover); a "Pause/Play scrolling" button below. Edges fade (mask).
- Reduced motion: static, horizontally scrollable row; duplicate + button hidden.

## 4. Globe (`GlobeSection`) — "Where we are"
- Heading "Serving _Nashik_ & Pune"; text: "Two cities in Maharashtra, one team…"; legend: CityPill Nashik `{n} projects`, Pune `{n} projects` (counts from seed); link "Browse all projects" → `#projects`.
- Visual: cobe WebGL globe (2 markers Nashik/Pune, one arc, focus between) with DARK_PALETTE — **only on desktop, WebGL available, no reduced motion, once near view**; otherwise `StaticGlobe` (CSS disc).

## 5. Our projects (`ProjectsGrid` → `ProjectCutoutGrid`) — reads the **live catalog** (`useCatalog`)
- Heading: eyebrow "Our projects", "6 projects, _two_ cities" (static text — VERIFY should be dynamic), sub "Every enquiry is matched against real homes in Nashik and Pune."
- Grid 1/2/3 columns of **CutoutCards**: cover image (`project.image` or `/images/<slug>.jpg`), status pin top-right ("New" / "Ready to move" / "Under construction"), CityPill inset bottom-left, name, locality, unit types (derived), **Read more** (opens dialog). Cards reveal staggered on scroll.
- **Project dialog** (Radix): cover image, CityPill + status chip, name, "{locality}, {city} · sample project data for this demo", **description** (if set), facts (City, Locality, Status, Units "x available of y"), **Price range** (derived from properties, ₹ both ends), **Homes offered** (BHK chips from unit-type range), **Amenities** (✓ list), **Available homes** — a `PropertyCard` per property that isn't sold; footer **Close** / **Ask about {project}** (closes dialog, opens the call widget).

## 6. How it works (`Pillars`)
Tabs (`role="tablist"`, ←/→ keys) over a stacked-card deck (spring): 01 **Calls**, 02 **Sentiment**, 03 **Lead scoring**, 04 **Dashboards** — copy in `PILLARS` (BelowFold.tsx). Note: the "Dashboards" copy still says "Callers get their own simple page…" — **outdated vs rev 3, VERIFY/update copy**.

## 7. Signals (`Signals`)
Dark band. Title "Never miss your dream _Real Estate_" (orange italic), sub "Every call turns into a signal your team can act on." Three marquee rows of example chips (illustrative, not real people) at 40/55/70 s, alternate directions, rows 2–3 hidden on mobile; pause on hover/focus; **Pause/Play signals** button; sr-only static list; auto-paused under reduced motion.

## 8. At a glance (`AtAGlance`, `#about`) — honest content only
Title "Small, _focused_, local". Bento grid (1/2/4 cols), cards reveal staggered, hover lift:
- `{PROJECTS.length}` "Real estate projects across Nashik & Pune" (CountUp) · `{cities}` "Cities — Nashik & Pune" · `0` "Audio recordings stored — only transcripts" · Example card "Rahul asked about a 2 BHK in Baner → Matched to Baner Greens" (labelled *illustrative*) · **Why EstateIQ** statement card · "1 call — Just a call — no forms" · "Your enquiry, understood and matched to real homes" · second Example card · two empty **Client feedback — Coming soon** slots (deliberately empty).
- CountUp animates 1.2 s on view (instant under reduced motion).

## 9. Final CTA (`FinalCta`)
"Ready to _talk_?" + copy + **Call the agent** (orange) → widget; small print "Transcribed to help us serve you • No audio stored"; ArrowDoodle draws on view (desktop).

## 10. Footer (`Footer`)
Dark band. BrandMark + tagline "AI lead intelligence for real estate in Nashik and Pune." Columns: **Projects** (Nashik (n), Pune (n) → `#projects`), **Product** (Call the agent, Lead scoring, Dashboards → `#`), **Company** (About → `#about`, Contact → `#`), **Legal** (Privacy, Terms → `#`, **VERIFY: no pages yet**) + **Admin login** (12px muted link → `/admin/login`; the **only** login entry point). Bottom: "© {year} EstateIQ" · "We store call transcripts only — never audio."

---

## 11. Call-the-Agent widget (`CallWidget`) — every state

Props on the landing: `askName`, `hasBottomNav={false}`, `pillHidden` (true while the hero **Start call** or the final-CTA button is visible, so there's never two call buttons).

| State | What renders | Interactions |
|---|---|---|
| **Closed (pill)** | Fixed bottom-right pill "Call the agent" (ink bg, phone icon, gentle `.eq-breathe`). Hidden (slide/fade, `aria-hidden`, untabbable) when `pillHidden`. | Click → open |
| **Form** (dialog, centered, dim + blur backdrop, `.eq-pop` scale .96→1) | Title "Call the property assistant", optional "About **{presetProject}**", **Your name \*** (when `askName`), **Your mobile number \*** with fixed `+91` prefix, ✓ when valid, consent checkbox "This call is transcribed to help us serve you. We don't store audio.", **Start call** button (disabled until consent; helper "Tick the box above to start the call.") | Validation on blur and on submit: name non-empty ("Enter your name."); phone digits only, auto-formatted `98765 43210`, must match `^[6-9]\d{9}$` ("Enter a 10-digit mobile number."). Focus goes to name on open; Tab is trapped; Esc / backdrop / ✕ close. |
| **Connecting** | 3 bouncing dots, "Connecting…" | auto → Calling after 1.5 s (**mock timer**) |
| **Calling** | Pulsing rings (listening) or equalizer bars (assistant "speaking" 4 s of every 7 s — mock), "Listening…/Speaking…/Muted", call timer `m:ss`, "Speak naturally — in Hindi, Marathi or English.", **Mute/Unmute**, **End call** (red) | |
| **Done** | ✓ "Thanks for calling!" "We're matching homes to what you asked about. You'll see them in your enquiries shortly." (**copy refers to the removed client app — VERIFY/update**), **Done** | Close resets the form |
| **Failure / callback fallback** | **Not implemented** (DESIGN §22.6) — TODO | |

`aria-live` announces "Connecting call / Call connected / Call ended". **No network calls are made** — integrate Vapi Web SDK + `POST /public/call-sessions` (see API-CONTRACT §2).

Client-side data the widget would send: `{ name, phone: "+91XXXXXXXXXX", consent: true, project_id? }`.
