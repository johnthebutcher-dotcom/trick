# app-starter — rulebook

This repo is the template every app is built from. When a new app repo is created from it, this file comes along and these rules apply there too. Read it fully before changing anything.

## Purpose

Turn a plain-language description sent from a phone into a finished, cheap-to-run app: features, styling from a named preset, the right integrations, pushed to its own private GitHub repo. The person building with you is not at a desktop; assume every step must be doable from chat.

## Stack (do not swap without updating this file)

| Layer   | Choice                                                                  | Notes                                                                                               |
| ------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| App     | Vite + React 19 + TypeScript (strict), static PWA via `vite-plugin-pwa` | No server rendering. A static bundle deploys free and wraps cleanly in Capacitor for the App Store. |
| Styling | Tailwind CSS v4, tokens from `src/styles/presets/`                      | Default palette is removed on purpose. Utilities only exist for preset tokens.                      |
| Routing | `react-router` (library mode, `BrowserRouter`)                          | Import from `react-router`, never `react-router-dom`.                                               |
| Backend | Supabase: Postgres + Auth + Storage + Edge Functions                    | Free tier. RLS on every table. Secrets only in Edge Function secrets.                               |
| AI      | Always through an Edge Function (`supabase/functions/ai-extract`)       | The browser never holds a provider key. Model choice lives in function secrets, not in code.        |
| Quality | oxlint, `tsc -b`, Prettier, Vitest + Testing Library, gitleaks in CI    | `npm run check` runs all of it. CI runs the same on every push and PR.                              |
| Hosting | Vercel (or Netlify) static deploy from GitHub                           | Preview URL per PR. No paid tier needed.                                                            |

## Commands

```
npm run dev          # local dev server
npm run check        # lint + typecheck + format:check + test + build (the quality gate)
npm run preset -- bold-dark   # switch style preset (then update theme_color, see output)
npm run icons -- --color "#2563eb" --letter S   # regenerate PWA icons
npm run format       # fix formatting
npm run build:preview   # static demo build (hash routing, no SW, styleguide home) for artifact previews
```

## Folder layout

```
src/
  app/          App.tsx (route table), AppShell (frame + tabs), ProtectedRoute
  pages/        one file per route; thin, compose features and components (StyleguidePage = every component in the active preset)
  features/     auth/, onboarding/, account/, theme/ … domain logic and hooks, no generic UI
  components/   ui/ (Button, Input, Card, Spinner) and states/ (Empty, Error, Loading, Skeleton)
  lib/          env (validated), supabase (client), ai (photo→JSON), image (compress), online, utils
  styles/       index.css (token mapping), effects.css + effects-catalog.css, presets/ (one css + one rules.md per look, _tokens.md)
  test/         Vitest setup
supabase/
  migrations/   SQL, one file per change, RLS in the same file as the table
  functions/    Deno Edge Functions; each folder is one function
scripts/        use-preset, make-icons, backup/restore/pause
docs/           recipes/, app-store/, design-pass.md, effects.md, SPEC.md, BUILD_LOG.md, models.md
.claude/skills/ the repeatable procedures (new-app-from-description, add-ai-feature, …)
```

## Conventions

- TypeScript strict, `noUncheckedIndexedAccess` on. No `any`; type the edges (env, API responses) with zod and trust the middle.
- Pages are thin. Data fetching and mutations live in `features/<domain>/` as hooks and plain async functions.
- Every screen that loads data renders all four states: loading (`LoadingState`/`Skeleton`), empty (`EmptyState`), error (`ErrorState` with retry), and content. Offline is handled globally by `OfflineBanner`; mutations should fail with a clear message, not hang.
- Use the `@/` alias for imports. Named exports only, except `App`.
- Touch targets ≥ 44px. Primary actions are `block` buttons at the bottom of the screen on phones.
- Copy: sentence case, plain words, buttons are verbs. Error messages say what to do next.
- Keep the bundle lean: `React.lazy` any route that pulls in a heavy library; check `npm run build` output.

## Styling rules

1. Pick the preset by name from `src/styles/presets/presets.json` (keywords help) and switch with `npm run preset -- <name>`. Then set `theme_color` in `vite.config.ts` and `<meta name="theme-color">` in `index.html` to the preset's `themeColor`.
2. Read the preset's `*.rules.md` before building any UI and follow it: density, radii, shadows, motion, component shapes, copy tone.
3. Only token utilities: `bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-accent`, `bg-danger`, `bg-success`, `bg-warning`, `rounded-{sm,md,lg,xl,2xl,full}`, `shadow-{card,popover}`, `font-{sans,heading}`. No hex codes, no arbitrary colours, no `shadow-[…]`. If something is missing, add a token to every preset.
4. Both light and dark must look finished for `mode: auto` presets. Never hard-code white or black backgrounds.
5. New presets: copy an existing css + rules pair, change tokens, add an entry to `presets.json`. Keep the token names identical across presets (`src/styles/presets/_tokens.md` lists them all).
6. Effects are preset-driven (`src/styles/effects.css` + `effects-catalog.css`, catalogued with limits in `docs/effects.md`): glass, mesh/conic/animated gradients, glow borders, soft UI, masks, scroll-driven motion, View Transitions, fluid type, container queries, subgrid. Use them only where the preset's rules allow: one or two signature moves per screen, glass never on list rows, one animated layer, reduced motion always respected.
7. Effects are opt-in per app: before any UI is built, the owner ticks a checklist from `docs/effects-menu.md`; the ticks live in `docs/SPEC.md` → Effects and `npm run check:effects` (part of `npm run check` and CI) fails on anything unticked. Never add an effect that is not ticked; ask, then tick.
8. Dark mode is the default (`index.html` sets `data-theme` before paint). `mode: auto` presets get the sun/moon `ThemeToggle`; `mode: dark` presets hide it. Both modes must look finished.
9. Design pass before done: load a design skill such as `design-forge` (Impeccable + Vercel guidelines + UI UX Pro Max) when the session lists one; otherwise walk `docs/design-pass.md`. Either way, record the changes in `docs/BUILD_LOG.md`.

## Security rules (non-negotiable)

- Secrets never enter the repo. `.env` is git-ignored; only `.env.example` with empty values is committed. CI runs gitleaks on every push.
- The browser only ever has `VITE_SUPABASE_URL` and the anon/publishable key. Service role keys, AI keys, DB URLs: GitHub repository secrets, passed to Edge Function secrets by the `Supabase` workflow. Nothing else holds them.
- Every table: `alter table … enable row level security;` in the same migration that creates it, plus explicit policies. Default is deny. Test policies as a second user before calling a feature done.
- Edge Functions verify the caller's JWT before doing anything, and enforce per-user limits on anything that costs money (see `docs/recipes/photo-to-structured-data.md`).
- Account deletion must work from inside the app (`SettingsPage` → `delete-account` function). Do not remove it.
- Do not store user photos unless the feature needs them. Store what was extracted. If photos must be kept, compress first (`lib/image.ts`) and put them in a private bucket with RLS.

## Cost rules

- Stay on free tiers: Supabase (max two active projects; pause the rest with `scripts/pause.md`), Vercel/Netlify hobby, GitHub private repos.
- Before adding any paid API call: cheap path first (barcode lookup, cache, OCR + small model), escalate to a bigger model only on low confidence, and cap calls per user per day in the Edge Function.
- Prefer one Edge Function with a config secret for the model over many functions.

## Definition of done (for any feature, and for the first build of an app)

1. `npm run check` passes locally and CI is green.
2. Loading, empty, error and offline states exist for every new screen.
3. New tables have RLS and policies; migrations are in `supabase/migrations/` and applied.
4. New secrets are documented in `.env.example` (client) or in the recipe (Edge Function), never committed.
5. UI matches the preset rules and the design pass was run; both colour modes checked when the preset is `auto`.
6. `docs/BUILD_LOG.md` has an entry: what was built, decisions made, what was deliberately left out.
7. Pushed to GitHub on `main` (or a PR if the person asked for review), with a one-paragraph summary in chat.

## Workflow from the phone

1. The person creates the app repo on GitHub from this template ("Use this template" → private), grants the Claude GitHub app access, and sends the owner/repo plus the app description and preset name.
2. Attach the repo, read this file, then follow `.claude/skills/new-app-from-description/SKILL.md`.
3. Write `docs/SPEC.md` first (features, data, integrations, preset), then build in small pushes so progress is visible on GitHub and in the deploy preview.
4. The person creates the Supabase project in the dashboard and pastes secrets into GitHub → repo → Settings → Secrets and variables → Actions (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, plus `AI_*` and `ALLOWED_ORIGIN` when needed). The `Supabase` workflow (`.github/workflows/supabase.yml`) then applies migrations, deploys Edge Functions and sets their secrets; the `Backup` workflow handles backups and pausing. Give exact secret names and where each value lives. Never ask for values in chat.

## Git

- Commit early and often with messages that say what changed and why. Push to `main` unless asked for a PR.
- Never force-push `main`. Never commit `dist/`, `node_modules/`, `.env`, or `backups/`.
