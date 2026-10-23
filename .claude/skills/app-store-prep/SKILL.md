---
name: app-store-prep
description: Get an app ready for App Store and Play submission: privacy policy, in-app account deletion, permission wording, Sign in with Apple, age rating, Capacitor packaging. Use when the owner says "App Store", "TestFlight", "publish", "submit", or asks what is missing before shipping natively.
---

# app-store-prep

The PWA is the product; this is packaging and compliance. Work through the list and leave a checklist in `docs/BUILD_LOG.md` with what is done and what the owner must do in Apple/Google consoles.

## 1. Privacy policy

Fill `docs/app-store/privacy-policy-template.md` from the spec: what is collected, which providers (Supabase, host, AI provider, Apple/Google), photo handling (kept or not), retention, deletion, contact email (ask the owner for the email and legal name once). Publish it at a URL: simplest is `docs/privacy.md` plus GitHub Pages, or a `/privacy` route in the app. Both stores need the URL.

## 2. Account deletion

Follow `docs/app-store/account-deletion.md`: cascade on every table, buckets listed in `delete-account`, tested end to end. Play also needs a web page describing deletion; reuse the privacy page section.

## 3. Permissions

Fill the purpose strings in `docs/app-store/permission-wording.md` for every permission the app uses. Make sure each has an in-app pre-prompt and that declining does not break the app.

## 4. Sign in with Apple

If Google (or any third-party) sign-in is offered, Apple's is required. Follow `docs/app-store/sign-in-with-apple.md`; the owner does the Apple Developer part, you make sure `signInWithProvider('apple')` is reachable and the first-sign-in name capture is stored.

## 5. Age and content

Alcohol, gambling, mature themes → set the rating truthfully and add an age gate to onboarding when relevant.

## 6. Capacitor

Only when the web app is stable. `docs/app-store/capacitor.md` has the commands. Add `capacitor.config.ts`, `ios/` is generated and committed, `npx cap sync` after builds. Keep `dist` as the web dir. Add `capacitor://localhost` to Supabase redirect URLs and `ALLOWED_ORIGIN`.

## 7. Store listing

Name (≤ 30 chars), subtitle, description, keywords, screenshots (6.7" and 6.1"), support URL, privacy URL. Draft the text from the spec and give it to the owner in one message.

## Owner's part (say it plainly)

Apple Developer Program ($99/yr), a Mac with Xcode or a cloud build service, App Store Connect record, Apple sign-in keys, Google Play console if Android later. Nothing on this list can be done from chat.
