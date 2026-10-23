---
name: quality-gate
description: Run and pass the full quality gate before any push is called done: lint, type-check, format, tests, build, secrets scan, state coverage, both colour modes, RLS, bundle size. Use at the end of every feature and before saying "done" to the owner.
---

# quality-gate

CI runs the mechanical part on every push; this skill makes sure you ran it first and did the checks CI cannot.

## 1. Mechanical

```
npm run check
```

Lint (oxlint), `tsc -b`, Prettier check, Vitest, production build. Read every warning. Fix root causes; do not add `// oxlint-disable` or widen types to silence them.

If Edge Functions changed: `deno check supabase/functions/*/index.ts`.
If migrations changed: parse them with `pglast` (see `supabase-setup`).

## 2. Secrets

`git diff --cached` (or the full diff of the push) must contain no keys, tokens, connection strings or real email addresses. Quick local scan when gitleaks is not installed:

```
git grep -nE '(sk-[A-Za-z0-9]{10,}|sbp_[A-Za-z0-9]{10,}|eyJ[A-Za-z0-9_-]{20,}\.|postgres(ql)?://[^ ]+:[^ ]+@|AKIA[0-9A-Z]{16})' -- . ':!package-lock.json'
```

Anything found: remove it, rotate it, and tell the owner.

## 3. States and offline

For each new screen: loading, empty, error (with retry), content. Mutations show a busy state and a clear failure message. Nothing hangs when offline (`OfflineBanner` shows; actions fail fast).

## 4. Preset and colour modes

- No raw hex, no `shadow-[…]`, no non-token colour utilities (`git grep -nE 'bg-\[#|text-\[#|#[0-9a-fA-F]{6}' src` should hit only `vite.config.ts`/`index.html` theme colour).
- `mode: auto` presets: check dark mode too. Fastest route: `VITE_APP_NAME=<App> npm run build:preview`, serve `dist-preview/` locally and screenshot `/` (the styleguide) at 390×844 in light and dark with headless Chromium (Playwright `chromium.launch` with `colorScheme`), then look at the images. Confirm `document.documentElement.scrollWidth` is 390 and the console has no errors. If no browser is available, review every `bg-`/`text-` pairing in the diff.
- Touch targets ≥ 44px, labels on every input, `role`/`aria` on custom states.
- Effects used only where the preset's rules allow (glass not on list rows, one animated layer, `text-gradient` on at most one heading).
- The design pass (`docs/design-pass.md`, or a loaded design skill such as `design-forge`) was walked and its changes noted in the build log.

## 5. Data

- New tables: RLS on, policies present, impersonation test done (`supabase-setup`).
- Account deletion still works: new tables cascade from `auth.users`; new buckets with user folders are in `delete-account`'s list.

## 6. Bundle

`npm run build` output: main chunk under the configured limit; lazy-load any route that pulls a heavy library. Precache size reasonable (< 2 MB).

## 7. CI

After pushing: `gh run list --limit 3` (or the Actions tab) and wait for green. A red run is not done; read the log and fix.

## 8. Record

`docs/BUILD_LOG.md` entry, then the one-paragraph summary to the owner. Mention anything skipped and why.
