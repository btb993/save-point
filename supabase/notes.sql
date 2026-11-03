-- Save Point: game notes between friends (recommend, "skip this one", "how was it?", answers, cheers, replies, reactions).
-- Safe to run again: it updates an older setup in place.
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run. Needs friends.sql to have been run first.
-- Only friends can send each other notes; each person only sees notes they sent or received.

create table if not exists public.sp_notes (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  game jsonb not null default '{}'::jsonb check (pg_column_size(game) < 4000),
  body text not null default '' check (char_length(body) <= 500),
  reply_to uuid references public.sp_notes(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  check (sender <> recipient)
);
create index if not exists sp_notes_recipient on public.sp_notes (recipient, created_at desc);
alter table public.sp_notes enable row level security;

drop policy if exists "sp_notes read own" on public.sp_notes;
drop policy if exists "sp_notes send to friends" on public.sp_notes;
drop policy if exists "sp_notes mark read" on public.sp_notes;
drop policy if exists "sp_notes remove own" on public.sp_notes;
create policy "sp_notes read own" on public.sp_notes for select to authenticated using (auth.uid() in (sender, recipient));
create policy "sp_notes send to friends" on public.sp_notes for insert to authenticated with check (sender = auth.uid() and public.sp_are_friends(auth.uid(), recipient));
create policy "sp_notes mark read" on public.sp_notes for update to authenticated using (recipient = auth.uid()) with check (recipient = auth.uid());
create policy "sp_notes remove own" on public.sp_notes for delete to authenticated using (auth.uid() in (sender, recipient));

-- the person receiving a note can only flip "read"; nobody can rewrite a note after sending it
revoke update on public.sp_notes from authenticated;
grant update (read) on public.sp_notes to authenticated;

-- which kinds of notes exist (re-running this upgrades older setups that didn't have replies and reactions)
alter table public.sp_notes drop constraint if exists sp_notes_kind_check;
alter table public.sp_notes add constraint sp_notes_kind_check check (kind in ('rec', 'skip', 'ask', 'answer', 'cheer', 'reply', 'react'));

-- new notes arrive instantly instead of on the next check
do $$ begin alter publication supabase_realtime add table public.sp_notes; exception when duplicate_object then null; when undefined_object then null; end $$;
