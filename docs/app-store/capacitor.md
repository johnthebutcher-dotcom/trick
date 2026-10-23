# Wrapping the PWA for the App Store with Capacitor

Do this only when the web app is finished and used. The PWA is the product; Capacitor is packaging.

## Needs

- Apple Developer Program ($99/yr) and, for building, either a Mac with Xcode or a cloud builder (Codemagic, Expo EAS with a bare workflow, Bitrise).
- The app keeps depending on Supabase; nothing moves on-device.

## Steps

```
npm i @capacitor/core @capacitor/ios && npm i -D @capacitor/cli
npx cap init "{{APP_NAME}}" "{{com.yourname.appname}}" --web-dir dist
npm run build && npx cap add ios && npx cap sync
```

Then in Xcode (or the cloud builder's config):

1. Set the bundle id, team, version and build number.
2. Add icons (`npm run icons` output scaled; Xcode wants a 1024×1024 PNG) and a launch screen using the preset's background colour.
3. Paste the purpose strings from `permission-wording.md` into `Info.plist`.
4. Auth callbacks: Capacitor loads the app from `capacitor://localhost`, so add that origin to Supabase redirect URLs and `ALLOWED_ORIGIN`, or use the native Apple/Google plugins with `signInWithIdToken`.
5. Camera: `<input capture>` works in the WebView; switch to `@capacitor/camera` only if you need native cropping or higher quality.
6. Review checklist: account deletion in-app (done), privacy policy URL, age rating, screenshots for 6.7" and 6.1" phones (take them from the PWA at 1290×2796 and 1179×2556).

## Keep both in sync

`npx cap sync` after every `npm run build`. Add it to a `release:ios` npm script when the time comes.
