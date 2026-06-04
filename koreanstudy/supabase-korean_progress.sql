-- Per-set practice progress for the Korean app.
-- Run this once in the Supabase SQL editor (same project as geostudy).
-- One row per (user, set): the current sentence position + per-sentence results,
-- so a signed-in user can pick up exactly where they left off.

create table if not exists public.korean_progress (
  user_id        uuid        not null references auth.users (id) on delete cascade,
  set_name       text        not null,
  selected_count integer     not null,
  current_index  integer     not null,
  scores         jsonb       not null default '{}'::jsonb,
  updated_at     timestamptz not null default now(),
  primary key (user_id, set_name)
);

alter table public.korean_progress enable row level security;

-- Each user can only see and modify their own rows.
create policy "korean_progress - select own" on public.korean_progress
  for select using (auth.uid() = user_id);

create policy "korean_progress - insert own" on public.korean_progress
  for insert with check (auth.uid() = user_id);

create policy "korean_progress - update own" on public.korean_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "korean_progress - delete own" on public.korean_progress
  for delete using (auth.uid() = user_id);
