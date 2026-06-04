import { useEffect, useMemo, useRef, useState } from 'react'
import RaceSeries from './RaceSeries'
import { pickPassages } from './passages'
import { averageStats, type RaceStats } from './typing'
import {
  createLobby,
  getLobbyPassages,
  getResults,
  submitResult,
  type ResultRow,
} from './lobby'
import { navigate } from './App'

const SERIES = 5

const NAME_KEY = 'typeRaceName'

function rememberName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    /* ignore storage errors (private mode) */
  }
}
function savedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

// --- Shared: ask for a display name before racing ----------------------------
function NameForm({
  title,
  cta,
  onSubmit,
}: {
  title: string
  cta: string
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(savedName())
  const trimmed = name.trim()
  return (
    <form
      className="panel name-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!trimmed) return
        rememberName(trimmed)
        onSubmit(trimmed)
      }}
    >
      <h1>{title}</h1>
      <p>Pick a name your friends will recognise on the leaderboard.</p>
      <input
        className="text-input"
        autoFocus
        maxLength={24}
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="btn-row">
        <button className="btn primary" type="submit" disabled={!trimmed}>
          {cta}
        </button>
      </div>
    </form>
  )
}

// --- Host: name -> race a fresh passage -> create lobby ----------------------
export function MultiplayerHost() {
  const passages = useMemo(() => pickPassages(SERIES), [])
  const [name, setName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!name) {
    return (
      <NameForm
        title="Start a multiplayer race"
        cta={`Start ${SERIES}-test race →`}
        onSubmit={setName}
      />
    )
  }

  if (saving) {
    return <div className="panel"><h1>Saving your race…</h1></div>
  }

  // After all 5 tests: freeze these passages into a lobby and post the average.
  async function handleFinish(results: RaceStats[]) {
    setSaving(true)
    setError(null)
    const lobbyId = await createLobby(passages)
    if (!lobbyId) {
      setError('Could not create the lobby. Is the Supabase SQL set up?')
      setSaving(false)
      return
    }
    await submitResult(lobbyId, name!, averageStats(results))
    navigate(`/lobby/${lobbyId}`)
  }

  return (
    <>
      {error && <div className="panel error-banner">{error}</div>}
      <RaceSeries passages={passages} onFinish={handleFinish} />
    </>
  )
}

// --- Joiner: open a shared link, race the same passage -----------------------
export function Race({ lobbyId }: { lobbyId: string }) {
  const [passages, setPassages] = useState<string[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    getLobbyPassages(lobbyId).then((p) => {
      if (!alive) return
      if (p === null) setLoadError(true)
      else setPassages(p)
    })
    return () => {
      alive = false
    }
  }, [lobbyId])

  if (loadError) {
    return (
      <div className="panel">
        <h1>Race not found</h1>
        <p>This challenge link is invalid or the lobby no longer exists.</p>
        <div className="btn-row">
          <button className="btn" onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    )
  }

  if (passages === null) return <div className="panel"><h1>Loading race…</h1></div>

  if (!name) {
    return (
      <NameForm
        title="You've been challenged! ⚔️"
        cta={`Start ${passages.length}-test race →`}
        onSubmit={setName}
      />
    )
  }

  if (saving) return <div className="panel"><h1>Saving your score…</h1></div>

  async function handleFinish(results: RaceStats[]) {
    setSaving(true)
    await submitResult(lobbyId, name!, averageStats(results))
    navigate(`/lobby/${lobbyId}`)
  }

  return <RaceSeries passages={passages} onFinish={handleFinish} />
}

// --- Lobby: the shared leaderboard -------------------------------------------
export function Lobby({ lobbyId }: { lobbyId: string }) {
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const me = savedName()

  const raceLink = `${location.origin}${location.pathname}#/race/${lobbyId}`

  async function refresh() {
    const rows = await getResults(lobbyId)
    setResults(rows)
    setLoading(false)
  }

  // Initial load + light polling so new finishers appear without a manual reload.
  const timer = useRef<number | null>(null)
  useEffect(() => {
    refresh()
    timer.current = window.setInterval(refresh, 4000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId])

  async function share() {
    const shareData = {
      title: 'Type Race challenge',
      text: 'Think you type fast? Beat my score:',
      url: raceLink,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    copyLink()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(raceLink)
    } catch {
      /* clipboard blocked — the input below is selectable as a fallback */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="panel">
      <h1>Leaderboard</h1>
      <p className="board-sub">Score is the average WPM across all 5 tests.</p>

      <div className="share-box">
        <p className="share-label">Challenge link — drop this in the group chat:</p>
        <div className="share-row">
          <input className="text-input mono" readOnly value={raceLink} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button>
          <button className="btn primary" onClick={share}>Share</button>
        </div>
      </div>

      {loading ? (
        <p>Loading scores…</p>
      ) : results.length === 0 ? (
        <p>No finishers yet. Be the first!</p>
      ) : (
        <ol className="leaderboard">
          {results.map((r, i) => {
            const mine = me && r.player_name === me
            return (
              <li key={r.id} className={`${i === 0 ? 'leader' : ''} ${mine ? 'mine' : ''}`}>
                <span className="rank">{i + 1}</span>
                <span className="who">
                  {r.player_name}
                  {i === 0 && ' 👑'}
                  {mine && <span className="you-tag">you</span>}
                </span>
                <span className="mono wpm-cell">{Math.round(r.wpm)} wpm</span>
                <span className="mono acc-cell">{r.accuracy}%</span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="btn-row">
        <button className="btn" onClick={refresh}>Refresh</button>
        <button className="btn" onClick={() => navigate(`/race/${lobbyId}`)}>Race again</button>
        <button className="btn" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  )
}
