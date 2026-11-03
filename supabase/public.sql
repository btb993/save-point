-- Save Point: public profile pages. Run once in Supabase: SQL Editor > New query > paste all of this > Run.
-- Only people who switch on "Public profile" in the app get a row here. Anyone with the link can read that row;
-- only its owner can create, change or delete it. Turning the profile off deletes the row.

create table if not exists public.sp_public (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  slug text unique not null check (slug ~ '^[a-z0-9_]{3,20}$'),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 600000),
  updated_at timestamptz not null default now()
);
alter table public.sp_public enable row level security;

drop policy if exists "sp_public read" on public.sp_public;
drop policy if exists "sp_public add own" on public.sp_public;
drop policy if exists "sp_public change own" on public.sp_public;
drop policy if exists "sp_public remove own" on public.sp_public;
create policy "sp_public read" on public.sp_public for select to anon, authenticated using (true);
create policy "sp_public add own" on public.sp_public for insert to authenticated with check (user_id = auth.uid());
create policy "sp_public change own" on public.sp_public for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sp_public remove own" on public.sp_public for delete to authenticated using (user_id = auth.uid());
