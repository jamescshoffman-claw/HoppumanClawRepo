-- ===========================================================================
--  MIGRATION: lobbies.passage (single text) -> lobbies.passages (text[])
--
--  Run this ONCE if you already ran the original typeracer.sql (which created a
--  single `passage` column). It switches a lobby to hold a set of passages so a
--  multiplayer score is the average of 5 races. A fresh install from the current
--  typeracer.sql already has the array column and does NOT need this.
--
--  Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--
--  Safe to run more than once (every step is guarded), so if a previous attempt
--  half-applied, just run this whole file again.
-- ===========================================================================

-- Existing lobby rows are test / old single-passage data that can't be replayed
-- under the new 5-test format. Clear them first: an old row would become an
-- empty passages array and violate the new constraint below. The FK
-- (race_results -> lobbies, on delete cascade) cleans up their results too.
delete from public.lobbies;

-- The old insert policy and constraint reference the old `passage` column, so
-- drop them (plus any partially-applied new constraint) before changing columns.
drop policy if exists "anyone can create a lobby" on public.lobbies;
alter table public.lobbies drop constraint if exists passage_len;
alter table public.lobbies drop constraint if exists passages_count;

-- Swap the column to a text[] of passages.
alter table public.lobbies drop column if exists passage;
alter table public.lobbies add column if not exists passages text[] not null default '{}';
alter table public.lobbies alter column passages drop default;

-- Re-add the count constraint and insert policy against the new array column.
alter table public.lobbies add constraint passages_count
  check (coalesce(array_length(passages, 1), 0) between 1 and 10);

create policy "anyone can create a lobby"
  on public.lobbies for insert
  to anon, authenticated
  with check (coalesce(array_length(passages, 1), 0) between 1 and 10);
