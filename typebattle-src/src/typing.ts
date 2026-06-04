// Shared scoring math for the typing tests.

export interface RaceStats {
  wpm: number          // words per minute (standard: chars / 5 / minutes)
  accuracy: number     // 0–100, correct keystrokes / total keystrokes
  elapsedSeconds: number
}

// Standard TypeRacer-style WPM: a "word" is 5 characters. Based on the length
// of the (fully correct) passage and the elapsed time.
export function computeStats(
  passageLength: number,
  totalKeystrokes: number,
  correctKeystrokes: number,
  elapsedMs: number,
): RaceStats {
  const minutes = Math.max(elapsedMs / 60000, 1 / 60000)
  const wpm = Math.round(passageLength / 5 / minutes)
  const accuracy = totalKeystrokes === 0
    ? 100
    : Math.round((correctKeystrokes / totalKeystrokes) * 1000) / 10
  return {
    wpm,
    accuracy,
    elapsedSeconds: Math.round((elapsedMs / 1000) * 10) / 10,
  }
}

// Combines a series of tests into one score: mean WPM and accuracy (the headline
// numbers), with elapsed time summed across all tests. Used so a multiplayer
// result is the average of 5 races rather than a single lucky/unlucky run.
export function averageStats(results: RaceStats[]): RaceStats {
  if (results.length === 0) return { wpm: 0, accuracy: 100, elapsedSeconds: 0 }
  const wpm = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length)
  const accuracy =
    Math.round((results.reduce((s, r) => s + r.accuracy, 0) / results.length) * 10) / 10
  const elapsedSeconds =
    Math.round(results.reduce((s, r) => s + r.elapsedSeconds, 0) * 10) / 10
  return { wpm, accuracy, elapsedSeconds }
}
