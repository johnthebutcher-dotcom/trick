# Sign in with Apple

Required on the App Store whenever the app offers any other third-party sign-in (Google, Facebook, …). Magic-link email alone does not trigger the requirement, but offering Apple is still the smoothest iOS experience.

## One-time setup (Apple Developer account, $99/yr)

1. **App ID:** Certificates, Identifiers & Profiles → Identifiers → App IDs → your bundle id → enable "Sign in with Apple".
2. **Services ID** (for the web/PWA flow): Identifiers → Services IDs → new, enable Sign in with Apple, configure: primary App ID = the one above, domains = `<project-ref>.supabase.co`, return URL = `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Key:** Keys → new → enable Sign in with Apple → download the `.p8` once. Note the Key ID and your Team ID.
4. **Supabase:** Authentication → Providers → Apple → paste Services ID (as Client ID), Team ID, Key ID, and the `.p8` contents (Supabase generates the client secret from it; the secret expires every 6 months, so set a reminder to regenerate).

The `.p8` file is a secret: password manager only, never the repo.

## In the app

`signInWithProvider('apple')` in `src/features/auth/actions.ts` already starts the flow. On the web it redirects through Apple; inside a Capacitor shell use the native plugin (`@capacitor-community/apple-sign-in`) and pass the identity token to `supabase.auth.signInWithIdToken({ provider: 'apple', token })` so users get the native sheet.

## Behaviour to handle

- Apple only sends name and email on the **first** sign-in; store what you need then (`profiles.display_name`).
- Users may choose "Hide my email"; the relay address works for magic links but looks odd in the UI. Show the display name, not the email.
- Offer the same account-deletion flow; Apple also asks that you revoke the Sign in with Apple token on deletion (Supabase handles the user; call Apple's revoke endpoint from `delete-account` if you store the refresh token).
