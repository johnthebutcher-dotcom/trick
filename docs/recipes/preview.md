# Recipe: preview a build from the phone

Two ways to look at the app without a deploy.

## 1. Styleguide route (any build)

`/styleguide` renders every component and effect in the active preset, with an Auto/Light/Dark toggle. The design pass uses it to check a preset at phone width in both modes. It ships in production too; remove the route from `src/app/App.tsx` if an app should not expose it.

## 2. Static preview build → artifact

```
VITE_APP_NAME="<App>" npm run build:preview
```

Produces `dist-preview/` with hash routing, no service worker, relative asset paths and the styleguide as the home screen. Claude publishes `dist-preview/artifact.html` plus the two asset files as a private artifact, so the owner can open the look on their phone before any hosting exists. Re-publish to the same artifact after changes.

For screenshots without a browser: a small Playwright script (headless Chromium at 390×844, light and dark) against `dist-preview/` is enough; see the quality-gate skill.

## Vercel/Netlify previews (once connected)

Every pull request gets a preview URL automatically; use `main` deploys for the real thing. Those builds use `npm run build` (browser routing, PWA on).
