# Recipe: backup, pause and resume (the two-active-apps routine)

The Supabase free tier allows a small number of active projects and pauses any project with no activity for about a week. Paused projects keep their data for a limited window; the docs have quoted both 90 days and one year, so plan on 90 and keep your own backup regardless. There are no automatic backups on the free tier.

## Before pausing an app

1. Make sure the repo is up to date on GitHub (`git status` clean, pushed).
2. Export the function secrets you set, into your password manager (not the repo): `supabase secrets list` shows names only, so keep the values where you first got them.
3. Back up:
   ```
   SUPABASE_DB_URL='postgresql://…' SUPABASE_URL='https://…' SUPABASE_SERVICE_ROLE_KEY='…' \
   scripts/backup.sh <app-name>
   ```
   The connection string is under Project Settings → Database (use the session pooler string). Output is `backups/<app>/<timestamp>.tar.gz`.
4. Verify the archive opens (`tar -tzf`) and move it off the laptop (cloud drive or B2). The folder is git-ignored and contains user data.
5. Pause:
   ```
   SUPABASE_ACCESS_TOKEN='sbp_…' scripts/pause.sh <project-ref> backups/<app>/<timestamp>.tar.gz
   ```
   The script refuses to pause without a readable backup. The project ref is in the dashboard URL.
6. Log the pause date in the app's `docs/BUILD_LOG.md` and set a reminder for 60 days to either resume or re-back-up.

## Resume

Dashboard → the paused project → **Resume project**. Secrets and functions survive a pause. If the restore window has lapsed, create a new project and run:

```
SUPABASE_URL='https://new…' SUPABASE_SERVICE_ROLE_KEY='…' \
scripts/restore.sh backups/<app>/<timestamp>.tar.gz 'postgresql://…new-db-url'
supabase link --project-ref <new-ref>
supabase functions deploy --no-verify-jwt
supabase secrets set AI_PROVIDER=… AI_MODEL=… AI_API_KEY=… AI_DAILY_LIMIT=20 ALLOWED_ORIGIN=…
```

Then update the app's deploy environment (Vercel/Netlify) with the new `VITE_SUPABASE_URL` and anon key and redeploy.

## Keeping an active app from auto-pausing

A few requests per day keep a free project active. A scheduled GitHub Action that hits a cheap endpoint (a `select 1` via PostgREST on a tiny public view, or a health Edge Function) once a day is enough; use it only for apps you actually want active.
