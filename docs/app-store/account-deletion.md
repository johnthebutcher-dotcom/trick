# Account deletion (App Store and Play requirement)

Both stores require that any app with account creation lets users delete the account from inside the app, and that deletion actually removes the data (not just deactivation).

## What the starter does

- `SettingsPage` → "Delete my account" → confirm → `features/account/deleteAccount.ts` → Edge Function `delete-account`.
- The function removes the user's storage folders, then deletes the auth user. Every table references `auth.users(id) on delete cascade`, so rows disappear with it.
- The client signs out and returns to the home screen.

## Checklist before submission

- [ ] Every table that holds user data has `user_id … references auth.users (id) on delete cascade`.
- [ ] Every bucket with per-user folders is listed in `BUCKETS_WITH_USER_FOLDERS` in `supabase/functions/delete-account/index.ts`.
- [ ] Tested: create a user, add data, delete the account, confirm with the service role that nothing remains.
- [ ] The privacy policy describes deletion and states it is immediate.
- [ ] Google Play: the Data safety form also asks for a **web page** where users can request deletion without the app. Add a short page (GitHub Pages or the app's site) that says: sign in → Settings → Delete account, or email {{CONTACT_EMAIL}} from the account's address.
- [ ] If any data is kept after deletion for legal reasons (invoices, abuse logs), name it and the retention period in the policy.
