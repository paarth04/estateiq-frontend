# Design System (tokens, theme, motion, CSS utilities)

Source files: `src/styles/tokens.css` (values), `tailwind.config.js` (Tailwind mapping), `src/index.css` (custom classes/keyframes), `index.html` (pre-paint theme + motion flags), `src/lib/theme.ts`, `src/lib/motion.ts`, `src/lib/AppMotion.tsx`.

**Rules used across the code:** tokens only (no raw hex in components), every colour works in light **and** dark, text ≥ 4.5:1, orange (`--accent`) is the single accent and is reserved for emphasis.

## 1. Colour tokens

Stored as **RGB channels** (`"255 138 0"`) so Tailwind can add alpha: `bg-accent/15` → `rgb(var(--accent) / .15)`. In plain CSS use `rgb(var(--x))`.

### 1.1 Theme-scoped (light on `:root`, dark on `[data-theme="dark"]`)

| Token | Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `247 247 242` (#f7f7f2) | `23 24 23` (#171817) | Page background |
| `--surface` | `bg-surface` | `255 255 255` | `32 33 31` (#20211f) | Cards, tables, modals |
| `--surface-hover` | `bg-surface-hover` | `241 240 233` | `39 40 37` | Hover rows, tracks |
| `--surface-dark` | `bg-surface-dark` | `23 24 23` | `23 24 23` | Legacy alias for dark bands |
| `--ink` | `text-ink` | `23 24 23` | `243 240 232` (#f3f0e8) | Primary text |
| `--ink-soft` | `text-ink-soft` | `85 84 78` | `181 178 168` | Secondary text |
| `--ink-muted` | `text-ink-muted` | `111 108 100` (#6f6c64, darkened from spec #8f8c84 for 4.9:1) | `143 140 132` | Hints, placeholders |
| `--border` | `border-border` | `228 226 218` | `44 45 42` | Hairlines |
| `--accent` | `bg-accent` etc. | `255 138 0` (#ff8a00) | same | Fills, rules, active borders — **not text** |
| `--accent-ink` | `text-accent-ink` | `166 83 0` (#a65300, 5.1:1) | `255 138 0` | **Orange text** |
| `--accent-soft` | `bg-accent-soft` | `255 242 224` (#fff2e0) | `42 35 22` (#2a2316) | Tinted fills (active nav, assistant bubbles) |
| `--on-accent` | `text-on-accent` | `23 24 23` | `23 24 23` | Text on orange fills (dark, 7.5:1) |
| `--pastel-yellow` | | `255 240 196` | `58 50 24` | Bento cards |
| `--pastel-green` | | `214 238 210` | `30 50 36` | Bento cards |
| `--pastel-pink` | | `252 222 214` | `60 36 32` | Bento cards |
| `--pastel-lavender` | | `236 232 222` | `44 42 38` | Bento cards |
| `--shadow-sm` | `shadow-sm` | `0 4px 12px rgba(23,24,23,.06)` | `0 4px 12px rgba(0,0,0,.35)` | |
| `--shadow-md` | `shadow-md` | `0 8px 24px rgba(23,24,23,.08)` | `0 8px 24px rgba(0,0,0,.45)` | |
| `--shadow-lg` | `shadow-lg` | `0 16px 48px rgba(23,24,23,.12)` | `0 16px 48px rgba(0,0,0,.55)` | |
| `color-scheme` | | `light` | `dark` | Native controls/scrollbars |

### 1.2 Theme-independent

| Token | Value | Use |
|---|---|---|
| `--scrim` / `--on-scrim` | `23 24 23` / `243 240 232` | Media overlays (hero video, dialog backdrop) |
| `--hot` | `229 72 77` | Hot band |
| `--warm` | `245 165 36` | Warm band, "Call back" status |
| `--cold` | `62 123 250` | Cold band, "Contacted" status, Pune in city split |
| `--positive` | `46 155 106` | Positive sentiment, Converted, SHAP up-bars |
| `--neutral` | `142 142 137` | Neutral sentiment, Not contacted |
| `--negative` | `229 72 77` | Negative sentiment, Lost, SHAP down-bars, errors |
| `--glow-orange` / `--glow-purple` | `255 138 0` / `255 178 92` | Legacy, unused for accents |

## 2. Typography

| Token / Tailwind | Size | Line-height | Notes |
|---|---|---|---|
| `--text-display` / `text-display` | 44px | 1.05, −0.04em | Section titles (landing) |
| `--text-display-lg` / `text-display-lg` | 72px | 1.05, −0.04em | Hero headline desktop |
| `--text-h1` / `text-h1` | 28px | 1.2 | |
| `--text-h2` / `text-h2` | 20px | 1.2 | Admin page titles |
| `--text-h3` / `text-h3` | 16px | 1.2 | Card titles |
| `--text-body` / `text-body` | 14px | 1.5 | Default |
| `--text-small` / `text-small` | 12px | 1.5 | Labels, hints |
| `--text-kpi` / `text-kpi` | 32px | 1.2 | KPI numbers |

Families: `font-sans` = Inter; `font-display` = Inter Tight; `font-text` = Inter + **Noto Sans Devanagari** (transcripts, enquiry card). `.tnum` = tabular numbers.

## 3. Spacing, radius, z-index, focus

- Spacing (`--space-1..16`): 4, 8, 12, 16, 24, 32, 48, 64 px — matches Tailwind's default scale.
- Radius: `--radius-control` 4px (`rounded-control`), `--radius-card` 4px (`rounded-card`), `--radius-pill` 9999px (`rounded-pill`).
- Z-index ladder: base 0 · sticky-nav 100 · dropdown 200 · widget 300 · modal-backdrop 400 · modal 410 · toast 500 · tooltip 600 (`z-sticky-nav`, … `z-tooltip`).
- Focus: `--focus-ring: 0 0 0 2px rgb(var(--bg)), 0 0 0 4px rgb(var(--accent-ink))` → `shadow-focus`. Global `:focus-visible { outline:none; box-shadow: var(--focus-ring) }` (keyboard only).
- Aspect ratio: `aspect-wide` = 2/1.

## 4. Motion tokens

| Token | Value | Tailwind |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | `ease-out` |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | |
| `--dur-fast` | 150ms | `duration-fast` |
| `--dur-base` | 250ms | `duration-base` |
| `--dur-slow` | 500ms | `duration-slow` |
| `--dur-reveal` | 700ms | `duration-reveal` |
| `--stagger` | 70ms | used by `.reveal` / `.eq-word` |

Springs in TS: sidebar & KPI shift = `{ type:"spring", bounce:0.2, duration:0.5 }`.

## 5. Custom CSS classes (`src/index.css`)

| Class | What it does |
|---|---|
| `.tnum` | tabular numerals |
| `.reveal` + `.is-visible` | fade-up on scroll (opacity/translateY, staggered by `--i`) |
| `.eq-word` | headline word rise (staggered) |
| `.eq-ring`, `.eq-breathe`, `.eq-risein`, `.eq-dot`, `.eq-eq` | call widget pulses, floating pill breathe, popup rise, connecting dots, speaking equalizer |
| `.eq-blob`, `.eq-grain`, `.eq-float`, `.eq-draw` | legacy hero decor / doodle float / SVG stroke draw |
| `.hero-idle .hl-*`, `.hero-paused` | hero idle loops (legacy choreography), paused off-screen |
| `.eq-marquee`, `__track`, `--reverse`, `-paused`, `--click` | infinite marquee (translateX 0→−50%); pause on hover/focus, or click-toggle variant (projects marquee) |
| `.eq-caret` | blinking orange caret (typewriters) |
| `.eq-glow-edge` | hero "Start call" glowing orange outline (stronger on hover/focus) |
| `.eq-bracket` (`--tl/--tr/--bl/--br`) | L-shaped corner marks on hero feature chips |
| `.eq-fade`, `.eq-pop` | dialog fade; call-widget pop (scale .96→1 + rise) |
| `.eq-kpi`, `--hl`, `.is-expanded`, `__drawer`, `__row` | KPI card: hover lift + orange border/shadow, highlighted variant, spring auto-height preview (grid-rows 0fr→1fr), staggered rows |
| `.eq-expand`, `.is-open` | auto-height expand (Leads row detail) |
| `.eq-transcript` | transcript panel with linen texture on `::before` (multiply in light, screen 0.22 in dark) |
| `.eq-sheet` | right drawer slide-in |

## 6. Theme handling

- Source of truth: `data-theme` on `<html>`. `index.html` sets it **before first paint** from `localStorage.eq-theme`, else `prefers-color-scheme`.
- `useTheme()` (`src/lib/theme.ts`) returns `{ theme: "light"|"dark", mode: "light"|"dark"|"system", setTheme(mode), toggle() }`. `system` removes `eq-theme` and follows the OS; changes are broadcast with a `window` `eq-theme` CustomEvent so every toggle stays in sync (top bar `ThemeToggle`, Settings).
- **Always-dark areas** set `data-theme="dark"` locally (hero, signals band, globe band, footer, navbar while over them), so tokens resolve dark inside them in both themes.
- Charts: Recharts writes colours as SVG attributes (CSS vars don't resolve there), so `useChartColors()` reads computed token values and re-reads on `data-theme` changes (MutationObserver).

## 7. Reduced motion (two sources, one behaviour)

| Source | Mechanism |
|---|---|
| OS `prefers-reduced-motion: reduce` | `@media` block in index.css + Framer's OS detection |
| In-app switch (Settings → Reduce motion) | `localStorage.eq-reduced-motion = "1"` → `<html data-reduced-motion="true">` (also set pre-paint in index.html) → mirrored CSS block `:root[data-reduced-motion="true"] …` |

- **All components import `useReducedMotion` from `@/lib/motion`** (OS **or** app flag), not from `motion/react`.
- `<AppMotion>` (`src/lib/AppMotion.tsx`) wraps Framer `MotionConfig` with `reducedMotion = forced ? "always" : "user"` (used by sidebar, Dashboard KPI/priority lists).
- Under reduced motion: typewriters show static text, chart draw-ins off, marquees become static scrollable rows, KPI spring/hover lift off, all CSS animation/transition durations ≈ 0.
