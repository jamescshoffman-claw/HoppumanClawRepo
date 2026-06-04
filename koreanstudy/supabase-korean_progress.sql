-- Per-set practice progress for the Korean app.
-- Run in the Supabase SQL editor (same project as geostudy).
--
-- One row per (user, set). It holds two things:
--   * the active round (round_ids / current_index / scores) so a signed-in user
--     can resume exactly where they paused, and
--   * cumulative mastery (seen / correct) that survives finishing a round and
--     drives the "✓ X/Y" counts on the main menu + the unseen-first picker.

-- ── Fresh install ───────────────────────────────────────────────────────────
create table if not exists public.korean_progress (
  user_id        uuid        not null references auth.users (id) on delete cascade,
  set_name       text        not null,
  -- active round (empty when no round is paused)
  round_ids      jsonb       not null default '[]'::jsonb,  -- ordered sentence ids
  current_index  integer     not null default 0,
  scores         jsonb       not null default '{}'::jsonb,  -- id -> true/false/null
  selected_count integer     not null default 0,            -- = length(round_ids)
  -- cumulative mastery (never cleared by finishing a round)
  seen           jsonb       not null default '{}'::jsonb,   -- id -> true (practiced)
  correct        jsonb       not null default '{}'::jsonb,   -- id -> true (ever right)
  updated_at     timestamptz not null default now(),
  primary key (user_id, set_name)
);

-- ── Already created the earlier version? Run this to add the new columns ──────
alter table public.korean_progress
  add column if not exists round_ids jsonb   not null default '[]'::jsonb,
  add column if not exists seen      jsonb   not null default '{}'::jsonb,
  add column if not exists correct   jsonb   not null default '{}'::jsonb;
alter table public.korean_progress
  alter column selected_count set default 0;

-- ── Row-level security: each user sees and edits only their own rows ─────────
alter table public.korean_progress enable row level security;

create policy "korean_progress - select own" on public.korean_progress
  for select using (auth.uid() = user_id);

create policy "korean_progress - insert own" on public.korean_progress
  for insert with check (auth.uid() = user_id);

create policy "korean_progress - update own" on public.korean_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "korean_progress - delete own" on public.korean_progress
  for delete using (auth.uid() = user_id);
