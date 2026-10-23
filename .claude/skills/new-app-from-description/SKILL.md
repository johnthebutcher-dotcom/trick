---
name: new-app-from-description
description: Build a complete app from a plain-language description sent from the owner's phone. Use when the owner sends an app idea plus an owner/repo (created from the app-starter template), with or without a preset name. Covers spec, preset, rename, data model, features, AI, quality gate, push, and the exact owner steps.
---

# new-app-from-description

The owner is on a phone. Every step must be doable from chat; never ask them to run commands locally. Ask at most one question before starting, and only if the answer changes the data model.

## Inputs

- `owner/repo` of a private repo created with **Use this template** from `app-starter`.
- The description (features, audience, anything about look and feel).
- Optional: preset name (`clean-light`, `bold-dark`, `warm-editorial`) or a described look.

## Steps

1. **Attach and verify.** Attach the repo and clone it. `CLAUDE.md` and `src/styles/presets/` must exist; if the repo is empty, the owner created a plain repo: ask them to delete it and recreate with "Use this template" (one tap), or attach `app-starter` as well and copy its tree in.
2. **Spec first.** Fill `docs/SPEC.md` from the description: one sentence, features in build order, "deliberately not in v1", tables with owner RLS, integrations (AI? photos kept? push?), secrets the owner must set, open questions. Push this alone as the first commit so the owner can read and redirect early. Do not wait for approval unless an open question blocks the data model.
3. **Effects checklist (always, before any UI).** Show the owner `docs/effects-menu.md` as a checklist, pre-ticked with the preset's suggested defaults, and ask them to confirm or change it. Use AskUserQuestion with multi-select when available (group the menu into its five headings, one question each, options = the items); otherwise send the numbered list in chat and wait. Never choose for them beyond the suggested defaults. Copy the result into `docs/SPEC.md` → "Effects". From then on `npm run check:effects` fails any screen that uses an unticked effect; if a later feature wants one more, ask first, then tick it.
4. **Preset.** Follow `style-presets` to pick by keywords or create one from the described look. Switch with `npm run preset -- <name>` and set the theme colour in `vite.config.ts` and `index.html`. Read the preset's rules file before writing any UI.
5. **Rename.** `package.json` name, `VITE_APP_NAME` default in `src/lib/env.ts` and `.env.example`, manifest `name`/`short_name`/`description` in `vite.config.ts`, `<title>` in `index.html`, `npm run icons -- --color <themeColor> --letter <first letter>`. Replace the starter copy in `AppShell`, `HomePage`, `OnboardingPage` steps with the app's own.
6. **Data model.** Follow `supabase-setup`: one migration per table, RLS in the same file, `user_id` cascade, owner policies. Add seed data only for lookups, never fake user rows.
7. **Features, in spec order.** For each: a `features/<domain>/` folder (hooks + async functions), a page under `pages/`, routes in `App.tsx`, all four states. Commit and push after each feature so progress is visible. Keep pages thin.
8. **AI feature** (if the spec has one): follow `add-ai-feature`. Barcode or cache first when possible (`stack-ai-pipeline`). Check `docs/models.md` freshness; run `choose-model` if stale.
9. **Design pass.** Follow the "Design pass" section of `style-presets`: load a design skill such as `design-forge` when the session lists one, otherwise `docs/design-pass.md`; fix hierarchy, rhythm, states and copy; apply the preset's one or two signature moves and nothing more.
10. **Quality gate.** Follow `quality-gate`. Fix everything it finds. Do not mark done with warnings you have not read.
11. **Build log.** Add a `docs/BUILD_LOG.md` entry: built, decided, left out, needs the owner, status.
12. **Owner steps, in one message.** Give exactly these, numbered, nothing else:
    1. Create a Supabase project (name, region close to them), set a strong DB password and keep it in their password manager.
    2. In GitHub → repo → Settings → Secrets and variables → Actions, add: `SUPABASE_ACCESS_TOKEN` (from supabase.com/dashboard/account/tokens), `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, and for an AI app `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`. The `Supabase` workflow then applies migrations and deploys functions on its own; they can re-run it from the Actions tab.
    3. In Supabase → Authentication → URL configuration, set the site URL and add `/auth/callback` redirect URLs; enable the providers the spec needs.
    4. In Vercel (or Netlify), import the GitHub repo, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase → Project Settings → API, deploy. Add the deployed URL as `ALLOWED_ORIGIN` in GitHub secrets and re-run the Supabase workflow.
    5. Open the preview link and tell you what to change.
13. **Finish** with a one-paragraph summary: what the app does now, what is stubbed, and the first thing to test.

## Rules of thumb

- Small pushes beat one big push; the owner follows along on GitHub.
- Prefer the starter's components and states over new ones; add to `components/ui` only when three screens need the same thing.
- Never store photos by default; store what was extracted.
- Anything that costs money gets a per-user cap before it ships (`ai-cost-guardrails`).
- When unsure between two interpretations of the description, build the simpler one and list the other under "Open questions" in the spec.
