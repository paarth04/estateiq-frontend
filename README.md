# EstateIQ — Frontend

The React UI for EstateIQ (AI real-estate lead intelligence). Built against **mock data** so it
runs with no backend; your teammate's FastAPI plugs in later by swapping one file.

Stack: **React 18 + Vite + TypeScript + Tailwind**, React Router, TanStack Query, Recharts,
lucide-react, motion. Design tokens come from the EstateIQ Design System.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
```

```bash
npm run build   # type-check + production build
```

## What's built

The full **client interface** (§10 of DESIGN.md): Home, My enquiries (+ detail with transcript),
Matched properties (filters), Projects (+ detail), Profile, and the floating **Call-the-agent**
widget. Clients never see score / SHAP / sentiment / intent / lost reasons (§12).

A **dev role switcher** sits bottom-left — flip between `client` / `agent` / `admin`. Only the
client app is built; `agent` and `admin` show a placeholder and are the next screens to build.

## How it's wired (so you can extend it confidently)

```
src/
  styles/tokens.css      ← design tokens (RGB-channel vars). Single source of truth.
  api/types.ts           ← the API contract (mirrors DESIGN.md §13). Shared with the backend.
  api/mock.ts            ← mock data + mock api{}. THE ONLY FILE THAT CHANGES AT INTEGRATION.
  api/hooks.ts           ← TanStack Query hooks wrapping api{}.
  components/            ← design-system components as .tsx (Button, CityPill, StatusPill,
                           PropertyCard, ProjectCard, Transcript, EnquiryDetailsCard, DataState).
  features/client/      ← the client app: layout, CallWidget, ClientUI context, screens/.
  App.tsx                ← routing + role switch.
```

- **Colors** are RGB channels in `tokens.css`; `tailwind.config.js` maps them with
  `rgb(var(--x) / <alpha-value>)`, so `bg-ink/20`, `bg-accent-soft/40` etc. all work. Change a
  value in `tokens.css` and the whole app updates. Keep it in sync with the Design System.
- **Devanagari**: transcripts / user speech use the `font-text` family (Inter + Noto Sans
  Devanagari) so code-mixed Hindi/Marathi/English renders without tofu.
- **States**: use `<DataState kind="loading|empty|error|processing" />` on every data surface.

## Integrating the real backend (later)

1. Agree the endpoint list and JSON shapes with your teammate. Draft is in `api/types.ts`
   (from DESIGN.md §13). Confirm the open items: intent label location, extracted-features
   table, notes/saved/callback/score-feedback, `leads.assigned_agent_id`, and the 0–100 score scale.
2. In `api/mock.ts`, replace each `api.*` body with a real `fetch` to that endpoint. Signatures
   and return types stay the same, so **no component changes**.
3. Add auth: swap the dev `RoleSwitcher` for the real JWT role from FastAPI and guard routes.
4. Wire the **Vapi Web SDK** into `CallWidget`'s `calling` stage.

## Building the rest with Claude Code

Open this folder in VSCode, start Claude Code, and give it prompts like:

> Build the **agent/admin shell + Leads list** (DESIGN.md §11.1–11.2) using our tokens and the
> components in `src/components`. Add the internal components first — ScoreBadge, SentimentChip,
> IntentChip, LeadsTable, WhyThisScore (the SHAP panel) — reading from `api/types.ts` Lead shape.
> Put it under `src/features/admin/`, reachable when the role switch is `agent`/`admin`.

Keep `DESIGN.md` and `src/styles/tokens.css` in the repo so Claude Code always has the blueprint
and the vocabulary in context.


