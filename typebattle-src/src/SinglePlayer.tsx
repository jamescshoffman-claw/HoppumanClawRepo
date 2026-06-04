import { useMemo, useState } from 'react'
import RaceSeries from './RaceSeries'
import { pickPassages } from './passages'
import type { RaceStats } from './typing'
import { navigate } from './App'

const TOTAL = 5

export default function SinglePlayer() {
  const passages = useMemo(() => pickPassages(TOTAL), [])
  const [results, setResults] = useState<RaceStats[] | null>(null)

  if (!results) {
    return <RaceSeries passages={passages} onFinish={setResults} />
  }

  const best = results.reduce((a, b) => (b.wpm > a.wpm ? b : a), results[0])
  const avg = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length)

  return (
    <div className="panel">
      <h1>Series complete 🎉</h1>
      <div className="summary-grid">
        <div className="summary-stat">
          <b>{avg}</b>
          <span>average wpm</span>
        </div>
        <div className="summary-stat">
          <b>{best.wpm}</b>
          <span>best wpm</span>
        </div>
        <div className="summary-stat">
          <b>{results.length}</b>
          <span>tests done</span>
        </div>
      </div>

      <ol className="result-list">
        {results.map((r, i) => (
          <li key={i}>
            <span>Test {i + 1}</span>
            <span className="mono">
              {r.wpm} wpm · {r.accuracy}% · {r.elapsedSeconds}s
            </span>
          </li>
        ))}
      </ol>

      <div className="btn-row">
        <button className="btn primary" onClick={() => window.location.reload()}>
          Play again
        </button>
        <button className="btn" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  )
}
