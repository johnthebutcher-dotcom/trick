# app-starter

The template every app is built from. Send an app description from your phone, Claude builds it here: a Vite + React + TypeScript PWA on Supabase, styled from a named preset, with the quality gate, security defaults and App Store groundwork already in place.

The rules Claude follows live in [`CLAUDE.md`](./CLAUDE.md). The repeatable procedures live in [`.claude/skills/`](./.claude/skills/).

## Make a new app

1. On GitHub, **Use this template** → create a **private** repo named after the app.
2. Grant the Claude GitHub app access to the new repo (GitHub → Settings → Applications → Claude → Configure).
3. In Claude, send: the `owner/repo`, the app description, and a preset name (`clean-light`, `bold-dark`, `warm-editorial`, `aurora-glass`, or describe the look you want).
4. Create a Supabase project when Claude asks, add the secrets it names to the repo's GitHub Actions secrets, and paste the URL and anon key into your hosting provider's env settings (never into chat). The repo's workflows do the rest.

## Run locally

```
npm install
cp .env.example .env    # fill in Supabase values, or leave empty to preview without a backend
npm run dev
npm run check           # lint, type-check, format, tests, build
```

## What's inside

- **Presets:** `src/styles/presets/` — one token file plus one rules file per look (`clean-light`, `bold-dark`, `warm-editorial`, `aurora-glass`). Switch with `npm run preset -- <name>`.
- **Effects:** liquid glass, mesh/conic/animated gradients (`@property`), glow borders, soft UI, masks and blends, scroll-driven reveals and parallax, View Transitions, fluid type, container queries and subgrid, all token-driven with reduced-motion and old-browser fallbacks. Catalog in `docs/effects.md`; before each build you tick which ones the app may use (`docs/effects-menu.md`) and `npm run check:effects` enforces it. Dark mode by default with a sun/moon toggle.
- **Design pass:** `docs/design-pass.md`, or a design skill such as `design-forge` when available, runs before any screen is called done.
- **App shell:** auth (magic link, Apple, Google), onboarding, settings with account deletion, offline banner, empty/error/loading states.
- **AI recipe:** `src/lib/ai.ts` + `supabase/functions/ai-extract` — photo in, validated JSON out, provider key kept server-side, per-user daily cap.
- **Supabase:** migrations with Row Level Security, `delete-account` function, backup/pause scripts for the free tier.
- **CI:** lint, type-check, tests, build and a secrets scan on every push; a `Supabase` workflow that applies migrations and deploys functions from GitHub secrets; a `Backup` workflow you can run from your phone.
- **App Store prep:** privacy policy template, permission wording, Sign in with Apple notes, Capacitor steps in `docs/app-store/`.
