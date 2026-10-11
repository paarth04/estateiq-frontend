# Shared & Reusable Components

All paths under `src/`. "Used by" lists live call-sites. Props are copied from the code; defaults shown as `= x`.

## 1. Primitives

### `components/Button.tsx` — `Button`
| Prop | Type | Default |
|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` |
| `className`, `children`, …all `<button>` attrs | | |

- primary = `bg-accent text-on-accent` (orange CTA); secondary = surface + border; ghost = transparent.
- States: hover (brightness / surface-hover), active `scale(.98)`, `disabled` → 50% opacity + no pointer events. Height 40px (`h-10`), `rounded-control`.
- Used by: landing (final CTA, project dialog), call widget, admin forms, Settings, dialogs.

### `components/Card.tsx` — `Card`, `SectionTitle`
- `Card({ children, className?, onClick? })`: surface + border + `rounded-card`. With `onClick` it becomes keyboard-operable (`role="button"`, Enter/Space) and gets hover.
- `SectionTitle({ children, action? })`. Used by `EnquiryDetailsCard`.

### `components/BrandMark.tsx` — `BrandMark({ wordmark = true, className })`
House outline whose roof is a sound wave + "Estate**IQ**" wordmark (IQ in `text-accent-ink`). Inherits `currentColor`.

### `components/CityPill.tsx` — `CityPill({ city })`
Small pill with a blue dot + city text.

### `components/ThemeToggle.tsx` — `ThemeToggle({ className })`
Sun/moon round button. `aria-pressed` = dark, label names the action. Uses `useTheme().toggle()` (switches explicit light/dark; Settings offers System).

## 2. AI / lead display components (admin only — never shown to clients)

### `components/ScoreBadge.tsx` — `ScoreBadge`
| Prop | Type | Default |
|---|---|---|
| `score` | `number` (0–100) | — |
| `band` | `"Hot" \| "Warm" \| "Cold"` | — |
| `provisional` | `boolean` | `false` → adds a small hollow dot + tooltip "Provisional — based on call signals, not yet learned from closed deals" + sr-only "(provisional)" |
| `showBand` | `boolean` | `true` |
| `showScore` | `boolean` | `true` (false → type-only badge, used in Leads "Type" column) |
| `className` | `string` | |
Pill tinted by band (`bg-hot/15 border-hot/40`, etc.) with a band-coloured dot.

### `components/StatusPill.tsx` — `StatusPill({ status, internal = false, className })`
Colour-coded status from `api/status.ts`. `internal` → admin label ("Visit scheduled"); default → client-friendly word (`statusToFriendly`, legacy).

### `api/status.ts` — status vocabulary (single source)
| id | Label | Dot / tone |
|---|---|---|
| `not_contacted` | Not contacted | neutral (grey) |
| `contacted` | Contacted | cold (blue) |
| `call_back` | Call back | warm (amber) |
| `visit_scheduled` | Visit scheduled | accent (orange) |
| `converted` | Converted | positive (green) |
| `lost` | Lost | negative (red) |
Exports `STATUSES`, `STATUS_LABEL`, `statusMeta(id)`.

### `components/SentimentChip.tsx` — `SentimentChip`
| Prop | Type | Default |
|---|---|---|
| `label` | `"Positive" \| "Neutral" \| "Negative"` | — |
| `confidence` | `number` 0–1 | optional |
| `threshold` | `number` | `0.6` |
| `className` | | |
- Green/grey/red tone. Tooltip: `"<label> · confidence NN% · model class: <SENTIMENT_MODEL_CLASS[label]>"`.
- **Low confidence** (confidence < threshold): dashed border, dimmed dot, suffix "· low confidence".
- Exports `SENTIMENT_MODEL_CLASS` (UI label → placeholder model class, **confirm with backend**): Positive→"Enthusiastic / Positive", Neutral→"Neutral", Negative→"Frustrated / Hesitant / Negative".

### `components/IntentChip.tsx` — `IntentChip({ intent, className })`
Neutral chip + icon per intent: Buy (Home), Rent (KeyRound), Invest (LineChart), Schedule visit (CalendarCheck), Info (MessageCircle), Other (HelpCircle). sr-only "Intent:". **Labels: confirm with backend.**

### `components/EnquiryDetailsCard.tsx` — `EnquiryDetailsCard({ details, friendly = true })`
NER output card. Rows: BHK (friendly: "Home type"), Budget, City, Locality / area (friendly: "Area"), Property type, Amenities, Furnishing. `null` → **"Not mentioned"** in muted text (never guessed). Admin passes `friendly={false}` (title "Enquiry details"). Uses `font-text` (Devanagari-capable).

### `components/Transcript.tsx` — `Transcript({ turns, youLabel = "You", highlights = [] })`
- Chat view, client left / assistant right; `lang` per turn.
- Client bubble: surface + 1px border, label `text-ink-soft`. **Property assistant** bubble: `bg-accent-soft`, no border, label `text-accent-ink` medium.
- `highlights`: exact substrings wrapped in `<mark>` (orange tint + 2px orange underline + medium). Unicode-aware split (no `\b`) so Devanagari works.
- Container `.eq-transcript`: surface + linen texture (see design-system).

### `components/WhyThisScore.tsx` — `WhyThisScore`
| Prop | Type |
|---|---|
| `score`, `band` | number, ScoreBand |
| `bars` | `{ feature: string; label: string; value: number }[]` (signed points, top contributors) |
| `modelVersion`, `scoredAt` | string |
| `provisional` | boolean = false |
| `className` | |
- Header "Why this score?" + ScoreBadge; provisional note (orange left rule).
- Summary sentence templated from top 2 positive + top 1 negative factors: *"Scored 89 — Hot, mainly because of asked to visit and positive tone on the call. Held back by no budget shared."*
- Diverging bars from a centre line (green right / red left, length ∝ |value|), label left, ±value right.
- **Animation (staged, once per mount, when ≥30% in view):** 1) summary types out (28 ms/char, caret), then swaps to the styled version; 2) bars grow from centre with 80 ms stagger, 500 ms ease-out; label + value fade in as each lands. Reduced motion → final state instantly. Screen readers get the full sentence immediately.
- Footer: model version · scored time · **Right / Wrong** feedback → "Wrong" asks **Too high / Too low** → "Thanks — feedback saved". (**Mock: not persisted.**)

## 3. Admin-only shared pieces

### `admin/components/TypewriterTitle.tsx` — `TypewriterTitle`
| Prop | Type | Default |
|---|---|---|
| `text` | string | — |
| `typingSpeed` | ms/char | 40 |
| `deleteSpeed` | ms/char | 22 |
| `holdDuration` | ms | 3500 |
| `className` | | |
Loop: type → hold → delete → 400 ms gap → retype. Invisible "ghost" copy reserves size (no layout shift). Pauses off-screen (IntersectionObserver). Reduced motion → static. Used **only** for the admin top-bar page title.

### `admin/components/Toast.tsx` — `useToast()` → `{ show(msg), node }`
Bottom-right success toast (green check), `role="status"` polite, auto-dismiss 3 s, closable. Used by Settings.

### `admin/catalogForms.tsx`
- `Sheet({ open, onClose, title, description?, children })` — right drawer on Radix dialog (focus trap, Esc, scroll lock, `.eq-sheet`).
- `ConfirmDelete({ open, onClose, onConfirm, what, detail? })` — confirm dialog, red-tinted Delete.
- `Field` (label above, required `*`, hint, inline error wired via `aria-describedby`), `ChipPicker` (toggle chips + "Add another…"), `ImageField` (file → data URL ≤1.5 MB, or `/images/...` path; **mock**), `ProjectForm`, `PropertyForm` (fields in admin.md), `PROPERTY_STATUS`.

### Dashboard building blocks exported from `admin/screens/Overview.tsx` (reused by Analytics/Settings)
`FilterTabs` (HaloTabs pill filter), `Panel` (titled chart card with empty state "No data in this range."), `HBar` (horizontal bar chart; props `data, c, animate, fill?, cells?, width = 96, onPick?, className?, outline = false`), `outlineCell`, `CitySplit`, `TopProjects` (`outline?`), `Budget`, `Funnel`, `CallsOverTime`, `LeadsDrawer({ data, onClose, onMarkContacted? })`, `tooltip(c)`, `axis(c)`, `metrics()`, `windows()`, `RANGES`, types `Range`, `CityFilter`.

`admin/useChartColors.ts` — `useChartColors(): Record<token, "rgb(r g b)">` for ink, ink-soft, ink-muted, border, surface, accent, accent-ink, cold, hot, warm, positive, neutral, negative.

## 4. Ported UI (`components/ui/`)

| File | Exports / props | Used by |
|---|---|---|
| `dialog.tsx` (Radix) | `Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent({ showCloseButton = true }), DialogHeader, DialogFooter, DialogTitle, DialogDescription`. Overlay `bg-scrim/50`, content centered `max-w-lg`, `.eq-fade`. | Landing project dialog, all admin drawers/confirms |
| `halo-tabs.tsx` (cult-ui → Base UI, retokenised) | `HaloTabs` (Root: `value`, `onValueChange`, …), `HaloTabsList({ variant = "underline" \| "pill", activateOnFocus, loopFocus })`, `HaloTabsTrigger({ value })` (active `text-accent-ink`), `HaloTabsIndicator({ variant })` (pill = `bg-accent-soft` + `ring-accent/40`, slides via `--active-tab-*` CSS vars with slight overshoot), `HaloTabsContent` | `FilterTabs` (Dashboard, Analytics, Leads tabs, Settings) |
| `cutout-card.tsx` | `CutoutCard({ hovered?, defaultHovered?, onHoveredChange?, trackPointerHover = true })`, `CutoutCardMedia/Image(alt required)/Overlay/Content/Footer/InsetLabel/Pin/Action(revealOnHover = true)`, `CutoutCorner({ size = 32 })`, class helpers, `useCutoutCard` | Landing project grid |
| `globe.tsx` (+ `globe-palettes.ts`) | `Globe({ markers, arcs = [], focus, size = 480, className, palette = LIGHT_PALETTE, labelClassName })`, types `GlobeMarker`, `GlobeArc`, `LatLng`, `locationToAngles`, palettes `LIGHT_PALETTE` / `DARK_PALETTE` | Landing globe section (lazy) |
| `carousel.tsx`, `loading-carousel.tsx` | Embla carousel; `LoadingCarousel({ tips, autoplayInterval, showNavigation, showIndicators, showProgress, aspectRatio, textPosition, backgroundTips, backgroundGradient, shuffleTips, onTipChange })` | **unused** (replaced by projects marquee) |

## 5. Landing-only components (`features/landing/`)
`Typewriter` (hero subtext loop), `ProjectMarquee`, `Navbar`, `Hero`, `ProjectCutoutGrid` + `ProjectDetail` dialog, `SectionHead`, `Reveal`, `Pillars`, `Signals`, `AtAGlance` (`FactCard`, `ExampleCard`, `FeedbackSlot`, `CountUp`, `BentoCard`), `FinalCta`, `Footer`, `GlobeSection` (`StaticGlobe` fallback), doodles (`BrushUnderline`, `ArrowDoodle`), `useInView(threshold = .15)`, `prefersReducedMotion()`. Details in client-landing.md.

`features/client/CallWidget.tsx` — `CallWidget({ open, onOpen, onClose, presetProject?, askName = false, hasBottomNav = true, pillHidden = false })`. Details in client-landing.md §9.

## 6. Legacy / unused (in tree, not rendered)

| Module | Was for | Note |
|---|---|---|
| `components/DataState.tsx` — `DataState({ kind: "loading"\|"empty"\|"error"\|"processing", message?, action?, onAction? })` | client dashboard | **Recommended** for real API loading/empty/error/"Processing…" states |
| `components/FilterChip.tsx` | client filters | |
| `components/ProjectCard.tsx` | client projects page | |
| `components/PropertyCard.tsx` | — | **In use** (landing dialog "Available homes"); shows image, title, project, price, beds, baths, area, city, furnishing chip, amenity tags; optional `onAsk` / `onSave` buttons (not used now) |
| `api/hooks.ts` + `api/mock.ts` `api{}`, `CLIENT`, `ENQUIRIES`, `statusToFriendly` | client dashboard | react-query hooks pattern worth reusing |
| `admin/screens/Placeholder.tsx` | stub pages | |
| `ui/carousel.tsx`, `ui/loading-carousel.tsx` | old hero carousel | |
| `HeroDoodles.tsx` `HouseCallDoodleAnimated`, `KeyDoodleAnimated`; `Doodles.tsx` `HouseCallDoodle`, `KeyDoodle` | old hero art | `BrushUnderline` and `ArrowDoodle` ARE used |
