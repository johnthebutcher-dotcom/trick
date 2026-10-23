-- Starter baseline: profiles (one per auth user) and ai_usage (per-user daily caps).
-- Every table enables Row Level Security in the same file that creates it.
-- Policies use (select auth.uid()) so Postgres evaluates it once per query.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for a user. Deleted automatically when the auth user is deleted.';

alter table public.profiles enable row level security;

create policy "profiles: owner can read"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: owner can update"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert policy: rows are created by the trigger below.
-- No delete policy: rows go away with the auth user (on delete cascade).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ai_usage: one row per user per UTC day. Written only by Edge Functions using
-- the service role; the owner may read their own usage (for a "scans left" UI).
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  calls integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  primary key (user_id, day)
);

comment on table public.ai_usage is 'Per-user, per-day AI call counters used for cost guardrails.';

alter table public.ai_usage enable row level security;

create policy "ai_usage: owner can read"
  on public.ai_usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/update/delete policies for clients. The service role bypasses RLS.

-- Reserve one call atomically. Returns the new call count, or -1 when the
-- daily limit would be exceeded (and leaves the count untouched in that case).
create or replace function public.ai_usage_reserve(p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_calls integer;
begin
  insert into public.ai_usage (user_id, day, calls)
  values (p_user_id, v_day, 1)
  on conflict (user_id, day) do update
    set calls = public.ai_usage.calls + 1
    where public.ai_usage.calls < p_limit
  returning calls into v_calls;

  if v_calls is null then
    return -1;
  end if;
  return v_calls;
end;
$$;

-- Only Edge Functions (service role) may call it.
revoke execute on function public.ai_usage_reserve(uuid, integer) from public, anon, authenticated;
grant execute on function public.ai_usage_reserve(uuid, integer) to service_role;

-- Add tokens after a call completes.
create or replace function public.ai_usage_record(p_user_id uuid, p_input bigint, p_output bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.ai_usage
    set input_tokens = input_tokens + coalesce(p_input, 0),
        output_tokens = output_tokens + coalesce(p_output, 0)
  where user_id = p_user_id and day = (now() at time zone 'utc')::date;
$$;

revoke execute on function public.ai_usage_record(uuid, bigint, bigint) from public, anon, authenticated;
grant execute on function public.ai_usage_record(uuid, bigint, bigint) to service_role;
