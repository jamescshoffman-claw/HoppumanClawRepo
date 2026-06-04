import { useEffect, useRef, useState } from 'react'
import { computeStats, type RaceStats } from './typing'

interface Props {
  passage: string
  label?: string                       // e.g. "Test 2 of 5"
  onComplete: (stats: RaceStats) => void
}

// Word-delete (Ctrl/Alt+Backspace): drop any trailing spaces, then the run of
// non-space characters before them — so halfway through a word you jump back to
// the start of that word, just like a normal text editor.
function deleteWord(t: string): string {
  let end = t.length
  while (end > 0 && t[end - 1] === ' ') end--
  while (end > 0 && t[end - 1] !== ' ') end--
  return t.slice(0, end)
}

// Core TypeRacer-style test. You type the passage; correct characters turn
// green, wrong ones turn red. You can race ahead past a mistake, but the test
// only finishes once every character matches — so a wrong letter forces you to
// backspace and fix it before you can complete.
export default function TypingTest({ passage, label, onComplete }: Props) {
  const [typed, setTyped] = useState('')
  const [startMs, setStartMs] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [focused, setFocused] = useState(true)
  const [done, setDone] = useState(false)

  // Accuracy bookkeeping: count every character key pressed and how many landed
  // on the right letter. Backspaces don't count against you.
  const totalKeys = useRef(0)
  const correctKeys = useRef(0)
  const boxRef = useRef<HTMLDivElement>(null)

  // Reset all state whenever the passage changes (next test in the series).
  useEffect(() => {
    setTyped('')
    setStartMs(null)
    setNow(0)
    setDone(false)
    totalKeys.current = 0
    correctKeys.current = 0
    boxRef.current?.focus()
  }, [passage])

  // Live timer once typing has started.
  useEffect(() => {
    if (startMs === null || done) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [startMs, done])

  function finish(finalTyped: string, started: number) {
    setDone(true)
    const stats = computeStats(
      passage.length,
      totalKeys.current,
      correctKeys.current,
      Date.now() - started,
    )
    onComplete(stats)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (done) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      // Ctrl+Backspace (or Alt/Option+Backspace) deletes the whole current word.
      if (e.ctrlKey || e.altKey) setTyped(deleteWord)
      else setTyped((t) => t.slice(0, -1))
      return
    }

    // Only single printable characters advance the test.
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
    e.preventDefault()

    if (typed.length >= passage.length) return // can't type past the end

    const started = startMs ?? Date.now()
    if (startMs === null) setStartMs(started)

    const expected = passage[typed.length]
    totalKeys.current += 1
    if (e.key === expected) correctKeys.current += 1

    const next = typed + e.key
    setTyped(next)
    if (next === passage) finish(next, started)
  }

  const elapsedMs = startMs === null ? 0 : (now || Date.now()) - startMs
  const minutes = Math.max(elapsedMs / 60000, 1e-9)
  const liveWpm = startMs === null ? 0 : Math.round((typed.length / 5) / minutes)
  const hasError = typed.split('').some((c, i) => c !== passage[i])

  // Build the passage so each word's letters live inside one inline-block
  // wrapper that never wraps internally; the spaces between wrappers are the
  // only allowed line-break points. This guarantees a word is never split
  // across two lines, which keeps the text easy to read while racing.
  const nodes: React.ReactNode[] = []
  let word: React.ReactNode[] = []
  passage.split('').forEach((ch, i) => {
    let cls = 'pending'
    if (i < typed.length) cls = typed[i] === ch ? 'correct' : 'wrong'
    else if (i === typed.length) cls = 'cursor'
    const isSpace = ch === ' '
    const span = (
      <span key={i} className={`ch ${cls}`}>
        {isSpace ? ' ' : ch}
      </span>
    )
    if (isSpace) {
      if (word.length) {
        nodes.push(<span className="word" key={`w${i}`}>{word}</span>)
        word = []
      }
      nodes.push(<span key={`s${i}`} className="space">{span}</span>)
    } else {
      word.push(span)
    }
  })
  if (word.length) nodes.push(<span className="word" key="w-last">{word}</span>)

  return (
    <div className="test">
      {label && <div className="test-label">{label}</div>}

      <div className="stat-row">
        <span className="stat"><b>{liveWpm}</b> wpm</span>
        <span className="stat"><b>{(elapsedMs / 1000).toFixed(1)}</b> s</span>
        <span className="stat">
          <b>{typed.length}</b>/{passage.length}
        </span>
        {hasError && <span className="stat error-flag">fix the red letters</span>}
      </div>

      <div
        ref={boxRef}
        className={`passage ${focused ? '' : 'blurred'}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {nodes}
        {!focused && !done && (
          <div className="focus-hint">Click here and start typing</div>
        )}
      </div>
    </div>
  )
}
