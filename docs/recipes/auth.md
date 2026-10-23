# Recipe: auth

Already built: magic-link email, Apple and Google OAuth, session provider, protected routes, onboarding gate, sign out, account deletion. This page is what to configure and how to extend.

## Configure (Supabase dashboard → Authentication)

1. **URL configuration:** Site URL = the deployed app URL. Redirect URLs: add `http://localhost:5173/auth/callback` and `https://<app-domain>/auth/callback` (one per preview domain pattern, e.g. `https://*-yourteam.vercel.app/auth/callback`).
2. **Email:** magic link works out of the box with Supabase's built-in sender for low volume; set up a custom SMTP provider before launch (the built-in one is rate limited and not for production).
3. **Providers:** enable Google and Apple. Apple needs the Services ID, Team ID, Key ID and the private key from the Apple Developer account (see `docs/app-store/sign-in-with-apple.md`). If you ship with Google only on the web, that is fine; on the App Store, offering any third-party login requires Apple's too.
4. **Rate limits / attack protection:** leave defaults, enable CAPTCHA (Turnstile) on sign-up if abuse appears.

## In code

- `useAuth()` gives `{ user, session, loading, configured, signOut }`.
- Add protected screens under `<ProtectedRoute>` in `src/app/App.tsx`.
- To require a completed profile instead of localStorage onboarding, read `profiles.onboarded_at` in `ProtectedRoute` and set it at the end of `OnboardingPage` via `supabase.from('profiles').update(...)`.
- Server-side, every Edge Function calls `getCaller(req)` first; never trust a user id sent in the body.

## Data access pattern

Queries go through the user's client (`requireSupabase()`), so RLS applies automatically:

```ts
const { data, error } = await requireSupabase()
  .from('bottles')
  .select('*')
  .order('created_at', { ascending: false })
```

Tables need `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade` plus owner policies; copy the pattern from `supabase/migrations/20261022000000_profiles_and_ai_usage.sql`.
