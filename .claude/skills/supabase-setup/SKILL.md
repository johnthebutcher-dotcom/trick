---
name: supabase-setup
description: Create tables, RLS policies, auth settings, storage buckets and Edge Function deployment for an app the same safe way every time, applied through the GitHub Actions `Supabase` workflow so the owner never runs a CLI. Use when a spec defines data, when adding a table, bucket or function, or when connecting a new Supabase project.
---

# supabase-setup

Everything reaches Supabase through `.github/workflows/supabase.yml`: on every push that touches `supabase/`, it links the project, runs `supabase db push`, deploys all functions with `--no-verify-jwt`, and sets function secrets from GitHub repository secrets. Your job is to write correct migrations and functions and to tell the owner which secrets to add.

## Migrations

- One file per change in `supabase/migrations/`, named `YYYYMMDDHHMMSS_<what>.sql` (UTC, later than every existing file).
- Every table in the same file: `create table`, `alter table … enable row level security`, policies, indexes, triggers. Never ship a table without RLS, even "temporary" ones.
- Owner pattern for user data:
  ```sql
  create table public.things (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  alter table public.things enable row level security;
  create policy "things: owner select" on public.things for select to authenticated using ((select auth.uid()) = user_id);
  create policy "things: owner insert" on public.things for insert to authenticated with check ((select auth.uid()) = user_id);
  create policy "things: owner update" on public.things for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  create policy "things: owner delete" on public.things for delete to authenticated using ((select auth.uid()) = user_id);
  create index things_user_id_idx on public.things (user_id);
  create trigger things_set_updated_at before update on public.things for each row execute function public.set_updated_at();
  ```
- Shared or public data (a catalogue): `select` policy `to anon, authenticated using (true)`, writes only via service role or an admin claim. Say in the migration comment who writes it.
- Functions: `security definer` plus `set search_path = ''` and fully qualified names; revoke execute from `public, anon, authenticated` unless clients must call them.
- Validate syntax before pushing: `python3 -c "import pglast; pglast.parse_sql(open('supabase/migrations/<file>').read())"` (pip `pglast`) catches typos the CI would otherwise hit after a link.
- Never edit a migration that has already run on a project; add a new one.

## Storage

Private bucket with per-user folders: copy `20261022000001_private_uploads_bucket.sql` with a new bucket id. Public bucket only for non-sensitive assets you control. Set `file_size_limit` and `allowed_mime_types` always.

## Edge Functions

- One folder per function under `supabase/functions/`, `index.ts` with `Deno.serve`. Reuse `_shared/auth.ts` (`getCaller`, `serviceClient`), `_shared/cors.ts`, `_shared/ai.ts`.
- First lines of every handler: preflight, method check, `getCaller` → 401. Validate the body by hand or with zod (`npm:zod`).
- Type-check locally before pushing: `deno check supabase/functions/<name>/index.ts` (`npm i -g deno` if missing).
- Secrets are read with `Deno.env.get`; document each new one in `docs/SPEC.md` and add it to the `Set function secrets` step list in `supabase.yml` so the workflow passes it through.

## Auth settings (owner, in the dashboard)

Site URL = deployed app; redirect URLs include `/auth/callback` for localhost, the production domain and the preview pattern; providers the spec needs; custom SMTP before launch. Details in `docs/recipes/auth.md`.

## Testing RLS as another user

In the SQL editor (or a migration-test script), impersonate:

```sql
set role authenticated;
set request.jwt.claims = '{"sub":"<other-user-uuid>","role":"authenticated"}';
select count(*) from public.things;  -- must be 0 for another user's rows
reset role;
```

Do this once for every new table before the feature is called done, and record it in the build log.

## Owner steps for a new project

Give them exactly: create project → GitHub secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` (plus `AI_*` and `ALLOWED_ORIGIN` when relevant) → re-run the `Supabase` workflow from the Actions tab → auth URL configuration → `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the hosting provider's env settings.
