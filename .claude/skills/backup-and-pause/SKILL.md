---
name: backup-and-pause
description: The two-active-apps routine for the Supabase free tier: back up an app's database and storage, pause it, resume or restore it later, all triggered from GitHub Actions so the owner only taps buttons on a phone. Use when the owner wants to pause, resume, switch which apps are active, or asks for a backup.
---

# backup-and-pause

Free tier rule of thumb: two active projects, pause the rest, never rely on a paused project surviving more than 90 days without your own backup. Full procedure in `docs/recipes/backup-and-pause.md`.

## Pause an app (owner is on a phone)

1. Confirm the repo is clean and pushed (`git status`), and that `.github/workflows/backup.yml` exists in that app's repo (it is part of the starter).
2. Check the app's GitHub secrets include `SUPABASE_DB_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`. If any are missing, list exactly which, with where to find each value (Project Settings → Database for the pooler string; → API for URL and service role key; account → Access Tokens; the ref is in the dashboard URL).
3. Tell the owner: GitHub app → repo → Actions → **Backup** → Run workflow → tick **pause** → Run. It backs up first and refuses to pause if the backup fails.
4. When it finishes, tell them to download the artifact (kept 90 days) to a cloud drive, and record the pause date in `docs/BUILD_LOG.md`. Add a 60-day reminder in chat if the owner wants one.

## Resume an app

Dashboard → paused project → Resume. Then re-run the **Supabase** workflow (Actions tab) to be sure functions and secrets are current, and check the hosting env still points at the same project.

## Restore into a new project (restore window lapsed, or moving)

Needs a desktop or a one-off Action: `scripts/restore.sh <backup.tar.gz> <new-db-url>` with `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` of the new project, then update GitHub secrets (`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), re-run the Supabase workflow, update the hosting env, redeploy. Write a temporary `restore.yml` workflow if the owner has no desktop; delete it afterwards.

## Keep an active app from auto-pausing

Add a tiny scheduled workflow that calls a cheap endpoint daily (a `select 1` through PostgREST on a public view, or a `health` Edge Function). Only for apps that should stay active.

## Never

- Pause without a verified backup.
- Put connection strings or keys in the repo or in chat; they live in GitHub secrets.
