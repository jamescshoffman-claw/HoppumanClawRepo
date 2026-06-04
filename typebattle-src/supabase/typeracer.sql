-- ===========================================================================
--  Type Race — Supabase schema
--  Run this once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--
--  This game has NO login. Players just type a display name, so the browser
--  talks to Supabase with the public "anon" key. Security therefore relies on:
--    1. Row-Level Security policies (below) that allow only the narrow actions
--       the game needs — create a lobby, read a lobby, post a result, read
--       results — and nothing else (no updates, no deletes from the client).
--    2. CHECK constraints that keep the data sane (name length, sane WPM, etc.)
--       so a malicious client can't write garbage rows.
-- ===========================================================================

-- A lobby is a frozen set of passages (5 by default) that every challenger in a
-- link races. Storing them as an array keeps all challengers on identical texts.
create table if not exists public.lobbies (
  id         uuid primary key default gen_random_uuid(),
  passages   text[] not null,
  created_at timestamptz not null default now(),
  constraint passages_count check (coalesce(array_length(passages, 1), 0) between 1 and 10)
);

-- One finished race posted by one player to one lobby.
create table if not exists public.race_results (
  id              uuid primary key default gen_random_uuid(),
  lobby_id        uuid not null references public.lobbies (id) on delete cascade,
  player_name     text not null,
  wpm             real not null,
  accuracy        real not null,
  elapsed_seconds real not null,
  created_at      timestamptz not null default now(),
  constraint name_len  check (char_length(player_name) between 1 and 24),
  constraint wpm_range check (wpm >= 0 and wpm <= 1000),
  constraint acc_range check (accuracy >= 0 and accuracy <= 100),
  constraint time_range check (elapsed_seconds >= 0 and elapsed_seconds <= 36000)
);

-- Leaderboard reads are filtered + sorted by these.
create index if not exists race_results_lobby_idx
  on public.race_results (lobby_id, wpm desc);

-- --- Row-Level Security ----------------------------------------------------
alter table public.lobbies      enable row level security;
alter table public.race_results enable row level security;

-- Lobbies: anyone may create one and anyone with the link may read it.
-- (Re-runnable: drop first so editing/re-pasting this file doesn't error.)
drop policy if exists "anyone can create a lobby" on public.lobbies;
create policy "anyone can create a lobby"
  on public.lobbies for insert
  to anon, authenticated
  with check (coalesce(array_length(passages, 1), 0) between 1 and 10);

drop policy if exists "anyone can read a lobby" on public.lobbies;
create policy "anyone can read a lobby"
  on public.lobbies for select
  to anon, authenticated
  using (true);

-- Results: anyone may post their own finished race and read the leaderboard.
-- No UPDATE or DELETE policies exist, so the client cannot alter or remove
-- scores once posted.
drop policy if exists "anyone can post a result" on public.race_results;
create policy "anyone can post a result"
  on public.race_results for insert
  to anon, authenticated
  with check (
    char_length(player_name) between 1 and 24
    and wpm between 0 and 1000
    and accuracy between 0 and 100
  );

drop policy if exists "anyone can read results" on public.race_results;
create policy "anyone can read results"
  on public.race_results for select
  to anon, authenticated
  using (true);

-- --- Grants ----------------------------------------------------------------
-- Supabase usually grants these to anon/authenticated automatically for new
-- tables, but we set them explicitly so the SQL is self-contained. RLS above
-- still gates exactly which rows/actions are permitted.
grant usage on schema public to anon, authenticated;
grant select, insert on public.lobbies      to anon, authenticated;
grant select, insert on public.race_results to anon, authenticated;
