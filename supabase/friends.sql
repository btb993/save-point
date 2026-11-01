-- Save Point: friends. Run once in Supabase: SQL Editor > New query > paste all of this > Run.
-- Adds three tables. Your existing games and Book Nook data are not touched.
--   sp_profiles  your gamer tag (friends find you by it)
--   sp_friends   friend requests and friendships
--   sp_shelves   the copy of your shelves and stats that friends can see (no notes, no sessions)

create table if not exists public.sp_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  name text not null default '' check (char_length(name) <= 40),
  buddy text not null default '' check (char_length(buddy) <= 12),
  updated_at timestamptz not null default now()
);
create table if not exists public.sp_friends (
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester, addressee),
  check (requester <> addressee)
);
create table if not exists public.sp_shelves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.sp_profiles enable row level security;
alter table public.sp_friends enable row level security;
alter table public.sp_shelves enable row level security;

create or replace function public.sp_are_friends(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.sp_friends f
    where f.status = 'accepted'
      and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a))
  );
$$;

-- profiles: anyone signed in can look up a gamer tag; you can only change your own
drop policy if exists "sp_profiles read" on public.sp_profiles;
drop policy if exists "sp_profiles add own" on public.sp_profiles;
drop policy if exists "sp_profiles change own" on public.sp_profiles;
drop policy if exists "sp_profiles remove own" on public.sp_profiles;
create policy "sp_profiles read" on public.sp_profiles for select to authenticated using (true);
create policy "sp_profiles add own" on public.sp_profiles for insert to authenticated with check (user_id = auth.uid());
create policy "sp_profiles change own" on public.sp_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sp_profiles remove own" on public.sp_profiles for delete to authenticated using (user_id = auth.uid());

-- friendships: you see your own; you send requests; the other person accepts; either can end it
drop policy if exists "sp_friends read own" on public.sp_friends;
drop policy if exists "sp_friends send" on public.sp_friends;
drop policy if exists "sp_friends accept" on public.sp_friends;
drop policy if exists "sp_friends remove" on public.sp_friends;
create policy "sp_friends read own" on public.sp_friends for select to authenticated using (auth.uid() in (requester, addressee));
create policy "sp_friends send" on public.sp_friends for insert to authenticated with check (requester = auth.uid() and status = 'pending');
create policy "sp_friends accept" on public.sp_friends for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid() and status = 'accepted');
create policy "sp_friends remove" on public.sp_friends for delete to authenticated using (auth.uid() in (requester, addressee));

-- shared shelves: you and your accepted friends can read; only you can write
drop policy if exists "sp_shelves read" on public.sp_shelves;
drop policy if exists "sp_shelves add own" on public.sp_shelves;
drop policy if exists "sp_shelves change own" on public.sp_shelves;
drop policy if exists "sp_shelves remove own" on public.sp_shelves;
create policy "sp_shelves read" on public.sp_shelves for select to authenticated using (user_id = auth.uid() or public.sp_are_friends(auth.uid(), user_id));
create policy "sp_shelves add own" on public.sp_shelves for insert to authenticated with check (user_id = auth.uid());
create policy "sp_shelves change own" on public.sp_shelves for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sp_shelves remove own" on public.sp_shelves for delete to authenticated using (user_id = auth.uid());
