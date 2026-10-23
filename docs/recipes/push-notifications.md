# Recipe: push notifications (PWA, web push)

Not wired by default; add it only when a feature needs it. Web push works on installed PWAs on iOS 16.4+, Android and desktop. No Firebase needed.

## Pieces

1. **VAPID keys** (one pair per app): generate once with `npx web-push generate-vapid-keys`. Public key → `VITE_PUSH_PUBLIC_KEY` in `.env` and `.env.example`; private key → `supabase secrets set PUSH_PRIVATE_KEY=...` (never in the repo).
2. **Table** `push_subscriptions (user_id, endpoint primary key, keys jsonb, created_at)` with RLS: owner can insert/delete/select own rows.
3. **Service worker handler:** switch `vite-plugin-pwa` to `injectManifest` mode with a custom `src/sw.ts` that adds `push` and `notificationclick` listeners (the generated `generateSW` worker cannot be extended).
4. **Subscribe from the client** after an explicit in-app prompt (never on first load):

```ts
const reg = await navigator.serviceWorker.ready
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: import.meta.env.VITE_PUSH_PUBLIC_KEY,
})
await supabase
  .from('push_subscriptions')
  .upsert({ endpoint: sub.endpoint, keys: sub.toJSON().keys })
```

5. **Send from an Edge Function** (`notify`) using the `web-push` npm package via `npm:web-push`, reading `push_subscriptions` with the service client, deleting rows that return 404/410.

## Rules

- Ask for permission with a screen that explains what the notifications are for; the OS prompt comes after the user says yes.
- Provide an in-app toggle to turn them off (deletes the subscription row).
- iOS requires the app to be installed to the Home Screen; show that hint when `navigator.standalone` is false.
- Permission wording for the App Store listing lives in `docs/app-store/permission-wording.md`.
