import { useEffect, useState } from 'react'
import TypingTest from './TypingTest'
import type { RaceStats } from './typing'

interface Props {
  passages: string[]
  onFinish: (results: RaceStats[]) => void
}

// Runs a series of typing tests back to back, showing a per-test result card
// between each. When the final test's card is dismissed it hands the full list
// of results to the parent, which decides what comes next — a summary screen in
// single player, or "saving…" then the leaderboard in multiplayer. Shared so
// both modes run the identical 5-test flow.
export default function RaceSeries({ passages, onFinish }: Props) {
  const total = passages.length
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<RaceStats[]>([])
  const [showInterstitial, setShowInterstitial] = useState(false)

  function handleComplete(stats: RaceStats) {
    setResults((r) => [...r, stats])
    setShowInterstitial(true)
  }

  function advance(allResults: RaceStats[]) {
    if (index >= total - 1) {
      onFinish(allResults)
      return
    }
    setShowInterstitial(false)
    setIndex((i) => i + 1)
  }

  // While the between-tests card is showing, Enter advances to the next test
  // (or finishes the series) so you can keep going without reaching for the mouse.
  useEffect(() => {
    if (!showInterstitial) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        advance(results)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInterstitial, results, index])

  if (showInterstitial) {
    const last = results[results.length - 1]
    const isLast = index === total - 1
    return (
      <div className="panel">
        <h1>Test {index + 1} of {total}</h1>
        <div className="summary-grid">
          <div className="summary-stat"><b>{last.wpm}</b><span>wpm</span></div>
          <div className="summary-stat"><b>{last.accuracy}%</b><span>accuracy</span></div>
          <div className="summary-stat"><b>{last.elapsedSeconds}s</b><span>time</span></div>
        </div>
        <div className="btn-row">
          <button className="btn primary" onClick={() => advance(results)}>
            {isLast ? 'Finish →' : 'Next test →'}
          </button>
          <span className="enter-hint">or press <kbd>Enter</kbd></span>
        </div>
      </div>
    )
  }

  return (
    <TypingTest
      key={index}
      passage={passages[index]}
      label={`Test ${index + 1} of ${total}`}
      onComplete={handleComplete}
    />
  )
}
