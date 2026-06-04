import { supabase } from './supabase'
import type { RaceStats } from './typing'

// A multiplayer "lobby" is one frozen passage that every challenger races. Each
// finished race is a row in race_results. No login required — players just type
// a display name. See supabase/typeracer.sql for the schema + RLS policies.

export interface ResultRow {
  id: string
  lobby_id: string
  player_name: string
  wpm: number
  accuracy: number
  elapsed_seconds: number
  created_at: string
}

// Creates a lobby that freezes the given set of passages and returns its id
// (used in the link). Every challenger races this exact same list of 5 texts.
export async function createLobby(passages: string[]): Promise<string | null> {
  const { data, error } = await supabase
    .from('lobbies')
    .insert({ passages })
    .select('id')
    .single()
  if (error) {
    console.error('Failed to create lobby:', error.message)
    return null
  }
  return data.id as string
}

// Fetches the passages for a lobby so a joiner races the exact same texts.
export async function getLobbyPassages(lobbyId: string): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('lobbies')
    .select('passages')
    .eq('id', lobbyId)
    .single()
  if (error) {
    console.error('Failed to load lobby:', error.message)
    return null
  }
  return data.passages as string[]
}

// Records one finished race in a lobby.
export async function submitResult(
  lobbyId: string,
  playerName: string,
  stats: RaceStats,
): Promise<boolean> {
  const { error } = await supabase.from('race_results').insert({
    lobby_id: lobbyId,
    player_name: playerName,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    elapsed_seconds: stats.elapsedSeconds,
  })
  if (error) {
    console.error('Failed to submit result:', error.message)
    return false
  }
  return true
}

// Leaderboard for a lobby: fastest WPM first.
export async function getResults(lobbyId: string): Promise<ResultRow[]> {
  const { data, error } = await supabase
    .from('race_results')
    .select('id, lobby_id, player_name, wpm, accuracy, elapsed_seconds, created_at')
    .eq('lobby_id', lobbyId)
    .order('wpm', { ascending: false })
  if (error) {
    console.error('Failed to load results:', error.message)
    return []
  }
  return data ?? []
}
