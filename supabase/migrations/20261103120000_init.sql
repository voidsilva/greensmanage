-- GreensManage: profiles + bets, isolated per user with Row Level Security.

create type public.bet_status as enum ('pending', 'green', 'red');
create type public.market as enum ('over_under', 'btts', 'match_result', 'corners', 'asian_handicap');

-- ── Profiles ──────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  starting_bankroll numeric(12, 2) not null default 1000 check (starting_bankroll >= 0),
  monthly_goal numeric(12, 2) not null default 500 check (monthly_goal >= 0),
  unit_size numeric(10, 2) not null default 50 check (unit_size > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Every new auth user gets a profile; the name comes from sign-up metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── Bets ──────────────────────────────────────────────────────
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code varchar(4) not null,
  game varchar(80) not null check (char_length(game) >= 3),
  league varchar(60) not null default 'Outros',
  market public.market not null,
  odd numeric(6, 2) not null check (odd > 1),
  stake numeric(10, 2) not null check (stake > 0),
  status public.bet_status not null default 'pending',
  placed_at timestamptz not null default now(),
  settled_at timestamptz,
  constraint settled_has_date check ((status = 'pending') = (settled_at is null))
);

create index bets_user_placed_idx on public.bets (user_id, placed_at desc);
create index bets_user_pending_idx on public.bets (user_id) where status = 'pending';

alter table public.bets enable row level security;

create policy "bets: read own" on public.bets
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "bets: insert own" on public.bets
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "bets: update own" on public.bets
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "bets: delete own" on public.bets
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Profit of everything settled before the dashboard window (runs as the caller, so RLS applies).
create function public.profit_before(p_from timestamptz)
returns numeric
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(sum(case
    when status = 'green' then stake * (odd - 1)
    when status = 'red' then -stake
    else 0 end), 0)
  from public.bets
  where placed_at < p_from;
$$;

grant execute on function public.profit_before(timestamptz) to authenticated;
