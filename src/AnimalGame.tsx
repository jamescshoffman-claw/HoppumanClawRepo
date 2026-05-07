import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

interface Animal {
  name: string
  emoji: string
  pop: number
}

// All populations are unique — no two animals share a value or a formatted display string.
const ANIMALS: Animal[] = [
  { name: 'Ant',           emoji: '🐜', pop: 20_000_000_000_000_000 },
  { name: 'Fish',          emoji: '🐟', pop: 1_000_000_000_000 },
  { name: 'Chicken',       emoji: '🐔', pop: 34_000_000_000 },
  { name: 'Human',         emoji: '🧑', pop: 8_100_000_000 },
  { name: 'Turkey',        emoji: '🦃', pop: 6_500_000_000 },
  { name: 'Rat',           emoji: '🐀', pop: 2_000_000_000 },
  { name: 'Sheep',         emoji: '🐑', pop: 1_200_000_000 },
  { name: 'Cow',           emoji: '🐄', pop: 1_000_000_000 },
  { name: 'Dog',           emoji: '🐕', pop: 900_000_000 },
  { name: 'Pig',           emoji: '🐷', pop: 800_000_000 },
  { name: 'Rabbit',        emoji: '🐇', pop: 700_000_000 },
  { name: 'Cat',           emoji: '🐈', pop: 600_000_000 },
  { name: 'Pigeon',        emoji: '🕊️', pop: 400_000_000 },
  { name: 'Parrot',        emoji: '🦜', pop: 350_000_000 },
  { name: 'Duck',          emoji: '🦆', pop: 300_000_000 },
  { name: 'Sparrow',       emoji: '🐦', pop: 250_000_000 },
  { name: 'Deer',          emoji: '🦌', pop: 100_000_000 },
  { name: 'Horse',         emoji: '🐴', pop: 60_000_000 },
  { name: 'Seagull',       emoji: '🐣', pop: 40_000_000 },
  { name: 'Penguin',       emoji: '🐧', pop: 30_000_000 },
  { name: 'Flamingo',      emoji: '🦩', pop: 3_000_000 },
  { name: 'Moose',         emoji: '🫎', pop: 2_000_000 },
  { name: 'Crocodile',     emoji: '🐊', pop: 1_000_000 },
  { name: 'Bison',         emoji: '🐃', pop: 500_000 },
  { name: 'Elephant',      emoji: '🐘', pop: 415_000 },
  { name: 'Chimpanzee',    emoji: '🐒', pop: 350_000 },
  { name: 'Wolf',          emoji: '🐺', pop: 300_000 },
  { name: 'Gorilla',       emoji: '🦍', pop: 200_000 },
  { name: 'Hippo',         emoji: '🦛', pop: 125_000 },
  { name: 'Giraffe',       emoji: '🦒', pop: 117_000 },
  { name: 'Jaguar',        emoji: '🐆', pop: 64_000 },
  { name: 'Rhino',         emoji: '🦏', pop: 27_000 },
  { name: 'Polar Bear',    emoji: '🐻‍❄️', pop: 26_000 },
  { name: 'Lion',          emoji: '🦁', pop: 25_000 },
  { name: 'Blue Whale',    emoji: '🐋', pop: 20_000 },
  { name: 'Tiger',         emoji: '🐯', pop: 4_500 },
  { name: 'Snow Leopard',  emoji: '🐱', pop: 6_400 },
  { name: 'Giant Panda',   emoji: '🐼', pop: 1_864 },
]

function fmtPop(n: number): string {
  if (n >= 1e15) return `${Math.round(n / 1e15)} quadrillion`
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)} trillion`
  if (n >= 1e9)  return `${+(n / 1e9).toFixed(1)} billion`
  if (n >= 1e6)  return `${+(n / 1e6).toFixed(1)} million`
  if (n >= 1e4)  return `${Math.round(n / 1e3)}k`
  return n.toLocaleString()
}

type Phase = 'playing' | 'showing' | 'gameover'

export default function AnimalGame() {
  const deckRef = useRef<Animal[]>([])

  const nextPair = (): [Animal, Animal] => {
    if (deckRef.current.length < 2) {
      deckRef.current = [...ANIMALS].sort(() => Math.random() - 0.5)
    }
    const a = deckRef.current.pop()!
    const b = deckRef.current.pop()!
    return [a, b]
  }

  const [pair, setPair] = useState<[Animal, Animal]>(() => nextPair())
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [chosen, setChosen] = useState<0 | 1 | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    document.title = 'Animal Showdown'
    return () => { document.title = 'James' }
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handlePick = (idx: 0 | 1) => {
    if (phase !== 'playing') return
    const other = (1 - idx) as 0 | 1
    const correct = pair[idx].pop >= pair[other].pop
    setChosen(idx)
    setWasCorrect(correct)
    setPhase('showing')

    timerRef.current = setTimeout(() => {
      if (correct) {
        setStreak(s => s + 1)
        setPair(nextPair())
        setChosen(null)
        setPhase('playing')
      } else {
        setPhase('gameover')
      }
    }, 1600)
  }

  const handleRestart = () => {
    clearTimeout(timerRef.current)
    deckRef.current = []
    setPair(nextPair())
    setStreak(0)
    setChosen(null)
    setPhase('playing')
    setCopied(false)
  }

  const handleShare = () => {
    const text = `🐾 Animal Showdown\nStreak: ${streak} in a row!\nPlay at whatisjamesdoing.com/animals`
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
      .catch(() => window.prompt('Copy your results:', text))
  }

  const correctIdx: 0 | 1 = pair[0].pop >= pair[1].pop ? 0 : 1

  if (phase === 'gameover') {
    return (
      <div className="ag-page">
        <Link to="/" className="ag-back">← James</Link>
        <div className="ag-gameover">
          <div className="ag-gameover__icon">🐾</div>
          <h1 className="ag-gameover__title">Game over!</h1>
          <p className="ag-gameover__streak">
            You got <strong>{streak}</strong> {streak === 1 ? 'answer' : 'answers'} in a row
          </p>
          <div className="ag-gameover__reveal">
            <div className="ag-gameover__animal">
              <span>{pair[chosen!].emoji}</span>
              <span>{pair[chosen!].name}</span>
              <span className="ag-gameover__pop">{fmtPop(pair[chosen!].pop)}</span>
            </div>
            <div className="ag-gameover__vs">vs</div>
            <div className="ag-gameover__animal ag-gameover__animal--correct">
              <span>{pair[correctIdx].emoji}</span>
              <span>{pair[correctIdx].name}</span>
              <span className="ag-gameover__pop">{fmtPop(pair[correctIdx].pop)}</span>
              <span className="ag-gameover__badge">MORE ✓</span>
            </div>
          </div>
          <div className="ag-gameover__actions">
            <button
              className={`ag-btn ag-btn--share${copied ? ' ag-btn--copied' : ''}`}
              onClick={handleShare}
            >
              {copied ? '✓ Copied!' : '📋 Share my streak'}
            </button>
            <button className="ag-btn ag-btn--restart" onClick={handleRestart}>
              Play again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ag-page">
      <Link to="/" className="ag-back">← James</Link>
      <div className="ag-header">
        <h1 className="ag-title">Animal Showdown</h1>
        <div className="ag-streak">
          {streak > 0 && <span className="ag-streak__flame">🔥</span>}
          <span className="ag-streak__num">{streak}</span>
          <span className="ag-streak__lbl">in a row</span>
        </div>
      </div>
      <p className="ag-prompt">Which animal has <strong>MORE</strong> in the world?</p>
      <div className="ag-cards">
        {([0, 1] as const).map(idx => {
          const animal = pair[idx]
          const isChosen = chosen === idx
          const isCorrectCard = idx === correctIdx
          let cardClass = 'ag-card'
          if (phase === 'showing') {
            if (isChosen) cardClass += wasCorrect ? ' ag-card--correct' : ' ag-card--wrong'
            else if (!wasCorrect && isCorrectCard) cardClass += ' ag-card--correct'
            else cardClass += ' ag-card--dim'
          }
          return (
            <button
              key={`${animal.name}-${idx}`}
              className={cardClass}
              onClick={() => handlePick(idx)}
              disabled={phase !== 'playing'}
            >
              <span className="ag-card__emoji">{animal.emoji}</span>
              <span className="ag-card__name">{animal.name}</span>
              {phase === 'showing' && (
                <span className="ag-card__pop">{fmtPop(animal.pop)}</span>
              )}
              {phase === 'showing' && isChosen && (
                <span className="ag-card__verdict">{wasCorrect ? '✓' : '✗'}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
