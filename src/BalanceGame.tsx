import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Canvas logical size ────────────────────────────────────────────────────
const CW = 600
const CH = 400

// ── Physics & game constants ───────────────────────────────────────────────
const PLANK_LEN   = 340    // px
const PLANK_H     = 14     // px
const BALL_R      = 20     // px
const GRAVITY     = 980    // px/s²  (≈ 9.8 m/s² at 100px/m)
const ROLL        = 5 / 7  // solid sphere rolling factor
const TILT_RATE   = 1.8    // rad/s while key held
const SPRING      = 1.6    // plank spring-back rate (rad/s per rad)
const MAX_TILT    = 1.15   // ≈ 66° max plank angle

type Phase = 'idle' | 'playing' | 'gameover'

// ── Pure canvas draw ───────────────────────────────────────────────────────
function draw(
  ctx: CanvasRenderingContext2D,
  phase: Phase,
  angle: number,
  ballPos: number,
  elapsed: number,
) {
  const cx = CW / 2
  const cy = CH / 2 + 30

  ctx.clearRect(0, 0, CW, CH)

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, CH)
  bg.addColorStop(0, '#111c2d')
  bg.addColorStop(1, '#090f18')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CW, CH)

  // Dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.022)'
  for (let x = 20; x < CW; x += 28)
    for (let y = 20; y < CH; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
    }

  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  // ── Pivot stand ──────────────────────────────────────────────────────────
  ctx.save()
  ctx.translate(cx, cy + PLANK_H / 2)
  ctx.fillStyle = '#3a2d1e'
  ctx.strokeStyle = '#5a4428'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(0, -16); ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.restore()

  // ── Plank ─────────────────────────────────────────────────────────────────
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 8

  const pg = ctx.createLinearGradient(0, -PLANK_H / 2, 0, PLANK_H / 2)
  pg.addColorStop(0,   '#9a6c38')
  pg.addColorStop(0.35,'#c48a48')
  pg.addColorStop(1,   '#5a3c18')
  ctx.fillStyle = pg
  ctx.beginPath()
  ctx.roundRect(-PLANK_LEN / 2, -PLANK_H / 2, PLANK_LEN, PLANK_H, 7)
  ctx.fill()

  // Plank top sheen
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(255,220,140,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(-PLANK_LEN / 2 + 2, -PLANK_H / 2 + 2, PLANK_LEN - 4, PLANK_H / 2 - 2, [6, 6, 0, 0])
  ctx.stroke()

  ctx.restore()

  // ── Ball ──────────────────────────────────────────────────────────────────
  const bx = cx + ballPos * cosA - BALL_R * sinA
  const by = cy + ballPos * sinA - BALL_R * cosA

  // Shadow blob on plank
  ctx.save()
  ctx.translate(cx + ballPos * cosA, cy + ballPos * sinA)
  ctx.rotate(angle)
  ctx.scale(1, 0.25)
  ctx.beginPath()
  ctx.arc(0, 0, BALL_R * 0.85, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fill()
  ctx.restore()

  // Ball body
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 5

  const ballGrad = ctx.createRadialGradient(
    bx - BALL_R * 0.28, by - BALL_R * 0.32, BALL_R * 0.04,
    bx, by, BALL_R,
  )
  ballGrad.addColorStop(0,   '#ff9966')
  ballGrad.addColorStop(0.45,'#e04515')
  ballGrad.addColorStop(1,   '#6a1808')
  ctx.fillStyle = ballGrad
  ctx.beginPath()
  ctx.arc(bx, by, BALL_R, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Specular highlight
  ctx.beginPath()
  ctx.arc(bx - BALL_R * 0.3, by - BALL_R * 0.36, BALL_R * 0.26, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.fill()

  // Soft rim
  ctx.beginPath()
  ctx.arc(bx, by, BALL_R, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,120,60,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  // ── Timer ─────────────────────────────────────────────────────────────────
  if (phase === 'playing') {
    ctx.save()
    ctx.font = 'bold 30px Geist, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(elapsed.toFixed(2) + 's', CW / 2, 46)
    ctx.restore()
  }

  // ── Idle hint ─────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    ctx.save()
    ctx.font = '16px Geist, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('Press  ←  or  →  to start', CW / 2, CH - 24)
    ctx.restore()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BalanceGame() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const phaseRef   = useRef<Phase>('idle')
  const keysRef    = useRef({ left: false, right: false })
  const gameRef    = useRef({ angle: 0, ballPos: 0, ballVel: 0, startMs: 0, elapsed: 0 })
  const rafRef     = useRef<number>()
  const lastMsRef  = useRef<number>()

  const [phase,     setPhase]     = useState<Phase>('idle')
  const [elapsed,   setElapsed]   = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [copied,    setCopied]    = useState(false)

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = CW * dpr
    canvas.height = CH * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    function endGame() {
      phaseRef.current = 'gameover'
      setPhase('gameover')
      setFinalTime(gameRef.current.elapsed)
      draw(ctx, 'gameover', gameRef.current.angle, gameRef.current.ballPos, gameRef.current.elapsed)
    }

    function loop(ms: number) {
      if (!lastMsRef.current) lastMsRef.current = ms
      const dt = Math.min((ms - lastMsRef.current) / 1000, 0.05)
      lastMsRef.current = ms

      const g = gameRef.current
      const k = keysRef.current

      if (phaseRef.current === 'playing') {
        // Tilt plank
        if (k.left)  g.angle -= TILT_RATE * dt
        if (k.right) g.angle += TILT_RATE * dt
        if (!k.left && !k.right) g.angle -= g.angle * SPRING * dt
        g.angle = Math.max(-MAX_TILT, Math.min(MAX_TILT, g.angle))

        // Ball physics
        g.ballVel += ROLL * GRAVITY * Math.sin(g.angle) * dt
        g.ballPos += g.ballVel * dt

        // Check fall
        if (Math.abs(g.ballPos) > PLANK_LEN / 2 + BALL_R) {
          endGame(); return
        }

        g.elapsed = (Date.now() - g.startMs) / 1000
        setElapsed(g.elapsed)
      }

      draw(ctx, phaseRef.current, g.angle, g.ballPos, g.elapsed)
      rafRef.current = requestAnimationFrame(loop)
    }

    // Initial draw
    draw(ctx, 'idle', 0, 0, 0)
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const start = () => {
      if (phaseRef.current !== 'idle') return
      const g = gameRef.current
      g.angle   = 0
      g.ballPos = 0
      g.ballVel = (Math.random() - 0.5) * 40  // tiny nudge so it's not static
      g.startMs = Date.now()
      g.elapsed = 0
      lastMsRef.current = undefined
      phaseRef.current  = 'playing'
      setPhase('playing')
      setElapsed(0)
    }

    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); keysRef.current.left  = true;  start() }
      if (e.key === 'ArrowRight') { e.preventDefault(); keysRef.current.right = true;  start() }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keysRef.current.left  = false
      if (e.key === 'ArrowRight') keysRef.current.right = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  // ── Title ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Balance'
    return () => { document.title = 'James' }
  }, [])

  const handleRestart = () => {
    phaseRef.current       = 'idle'
    keysRef.current        = { left: false, right: false }
    gameRef.current.angle   = 0
    gameRef.current.ballPos = 0
    gameRef.current.ballVel = 0
    gameRef.current.elapsed = 0
    lastMsRef.current       = undefined
    setPhase('idle')
    setElapsed(0)
    setCopied(false)
  }

  const handleShare = () => {
    const t = finalTime.toFixed(2)
    const text = `⚖️ I balanced a ball for ${t} seconds!\nCan you beat me? whatisjamesdoing.com/balance`
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
      .catch(() => window.prompt('Copy your result:', text))
  }

  return (
    <div className="bl-page">
      <Link to="/" className="ag-back">← James</Link>
      <div className="bl-header">
        <h1 className="bl-title">Balance</h1>
        {phase === 'playing' && (
          <div className="bl-live-time">{elapsed.toFixed(2)}s</div>
        )}
      </div>

      <div className="bl-canvas-wrap">
        <canvas
          ref={canvasRef}
          style={{ width: CW, height: CH }}
          className="bl-canvas"
        />
        {phase === 'gameover' && (
          <div className="bl-overlay">
            <div className="bl-overlay__inner">
              <div className="bl-overlay__label">Time balanced</div>
              <div className="bl-overlay__time">{finalTime.toFixed(2)}s</div>
              <div className="bl-overlay__actions">
                <button
                  className={`ag-btn ag-btn--share${copied ? ' ag-btn--copied' : ''}`}
                  onClick={handleShare}
                >
                  {copied ? '✓ Copied!' : '📋 Share my time'}
                </button>
                <button className="ag-btn ag-btn--restart" onClick={handleRestart}>
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="bl-hint">Hold  <kbd>←</kbd>  or  <kbd>→</kbd>  to tilt the plank</p>
    </div>
  )
}
