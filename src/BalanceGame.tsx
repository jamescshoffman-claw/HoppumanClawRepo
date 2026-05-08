import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Canvas & geometry ──────────────────────────────────────────────────────
const CW = 600
const CH = 400
const PLANK_CX  = CW / 2
const PLANK_CY  = CH / 2 + 30
const PLANK_LEN = 340
const PLANK_H   = 14
const BALL_R    = 20

// ── Physics constants ──────────────────────────────────────────────────────
const GRAVITY      = 980    // px / s²
const ROLL         = 5 / 7  // solid-sphere rolling factor
const PLAYER_ALPHA = 12     // plank angular accel from keys (rad/s²)
const SPRING_K     = 6      // spring restoring accel (rad/s² per rad)
const DAMPING      = 4.5    // angular velocity damping (1/s)
const I_PLANK      = 48000  // plank inertia normaliser for object torques
const MAX_TILT     = 1.15   // ~66°

type Phase = 'idle' | 'playing' | 'gameover'

// ── Falling object types ───────────────────────────────────────────────────
interface Obj {
  x: number; y: number; vy: number
  radius: number; mass: number
  light: string; mid: string; dark: string
  landed: boolean
  plankPos: number; plankVel: number
  gone: boolean
}

const OBJ_TYPES = [
  { radius: 13, mass: 1.8, light: '#ff9090', mid: '#e03030', dark: '#801010' },
  { radius: 10, mass: 0.9, light: '#80b0ff', mid: '#3070d0', dark: '#102070' },
  { radius:  7, mass: 0.4, light: '#ffe070', mid: '#c09020', dark: '#706010' },
]

function spawnObj(): Obj {
  const t = OBJ_TYPES[Math.floor(Math.random() * OBJ_TYPES.length)]
  return {
    x: 60 + Math.random() * (CW - 120),
    y: -t.radius - 5,
    vy: 60 + Math.random() * 80,
    ...t,
    landed: false, plankPos: 0, plankVel: 0, gone: false,
  }
}

// ── Canvas drawing ─────────────────────────────────────────────────────────
function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  light: string, mid: string, dark: string,
) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 16; ctx.shadowOffsetY = 5
  const g = ctx.createRadialGradient(x - r * .28, y - r * .32, r * .04, x, y, r)
  g.addColorStop(0, light); g.addColorStop(.45, mid); g.addColorStop(1, dark)
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  // specular
  ctx.beginPath()
  ctx.arc(x - r * .3, y - r * .36, r * .27, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.fill()
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  phase: Phase,
  angle: number,
  ballPos: number,
  elapsed: number,
  objects: Obj[],
) {
  const cosA = Math.cos(angle), sinA = Math.sin(angle)
  const cx = PLANK_CX, cy = PLANK_CY

  ctx.clearRect(0, 0, CW, CH)

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, CH)
  bg.addColorStop(0, '#111c2d'); bg.addColorStop(1, '#090f18')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

  // Dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.022)'
  for (let x = 20; x < CW; x += 28)
    for (let y = 20; y < CH; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
    }

  // Falling objects (drawn before plank so they visually go behind if close)
  for (const o of objects) {
    if (o.gone || o.landed) continue
    drawBall(ctx, o.x, o.y, o.radius, o.light, o.mid, o.dark)
  }

  // Pivot stand
  ctx.save()
  ctx.translate(cx, cy + PLANK_H / 2)
  ctx.fillStyle = '#3a2d1e'; ctx.strokeStyle = '#5a4428'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(0, -16); ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.restore()

  // Plank
  ctx.save()
  ctx.translate(cx, cy); ctx.rotate(angle)
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8
  const pg = ctx.createLinearGradient(0, -PLANK_H / 2, 0, PLANK_H / 2)
  pg.addColorStop(0, '#9a6c38'); pg.addColorStop(.35, '#c48a48'); pg.addColorStop(1, '#5a3c18')
  ctx.fillStyle = pg
  ctx.beginPath(); ctx.roundRect(-PLANK_LEN / 2, -PLANK_H / 2, PLANK_LEN, PLANK_H, 7); ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(255,220,140,0.28)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(-PLANK_LEN / 2 + 2, -PLANK_H / 2 + 2, PLANK_LEN - 4, PLANK_H / 2 - 2, [6, 6, 0, 0]); ctx.stroke()
  ctx.restore()

  // Landed objects (on top of plank surface)
  const cd_base = PLANK_H / 2
  for (const o of objects) {
    if (o.gone || !o.landed) continue
    const cd = cd_base + o.radius
    const ox = cx + o.plankPos * cosA + cd * sinA
    const oy = cy + o.plankPos * sinA - cd * cosA
    drawBall(ctx, ox, oy, o.radius, o.light, o.mid, o.dark)
  }

  // Main ball
  const bx = cx + ballPos * cosA - BALL_R * sinA
  const by = cy + ballPos * sinA - BALL_R * cosA
  // contact shadow
  ctx.save()
  ctx.translate(cx + ballPos * cosA, cy + ballPos * sinA); ctx.rotate(angle)
  ctx.scale(1, 0.22)
  ctx.beginPath(); ctx.arc(0, 0, BALL_R * .85, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill()
  ctx.restore()
  drawBall(ctx, bx, by, BALL_R, '#ff9966', '#e04515', '#6a1808')

  // Timer
  if (phase === 'playing') {
    ctx.save()
    ctx.font = 'bold 30px Geist, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(elapsed.toFixed(2) + 's', CW / 2, 46)
    ctx.restore()
  }

  // Idle hint
  if (phase === 'idle') {
    ctx.save()
    ctx.font = '16px Geist, system-ui, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('Press  ←  or  →  to start', CW / 2, CH - 24)
    ctx.restore()
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function BalanceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef  = useRef<Phase>('idle')
  const keysRef   = useRef({ left: false, right: false })
  const gameRef   = useRef({
    angle: 0, omega: 0,
    ballPos: 0, ballVel: 0,
    startMs: 0, elapsed: 0,
    objects: [] as Obj[],
    spawnTimer: 3,
  })
  const rafRef    = useRef<number>()
  const lastMsRef = useRef<number>()

  const [phase,     setPhase]     = useState<Phase>('idle')
  const [elapsed,   setElapsed]   = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [copied,    setCopied]    = useState(false)

  // ── Game loop ──────────────────────────────────────────────────────────
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
    }

    function loop(ms: number) {
      if (!lastMsRef.current) lastMsRef.current = ms
      const dt = Math.min((ms - lastMsRef.current) / 1000, 0.05)
      lastMsRef.current = ms

      const g   = gameRef.current
      const k   = keysRef.current
      const cosA = Math.cos(g.angle), sinA = Math.sin(g.angle)

      if (phaseRef.current === 'playing') {
        // ── Plank angular dynamics ─────────────────────────────────────
        let alpha = 0
        if (k.left)  alpha -= PLAYER_ALPHA
        if (k.right) alpha += PLAYER_ALPHA
        alpha -= SPRING_K * g.angle  // spring restoring

        // Object torques on plank
        for (const o of g.objects) {
          if (!o.landed || o.gone) continue
          alpha += (o.mass * GRAVITY * o.plankPos * Math.cos(g.angle)) / I_PLANK
        }

        g.omega += alpha * dt
        g.omega *= Math.max(0, 1 - DAMPING * dt)
        g.angle += g.omega * dt
        g.angle  = Math.max(-MAX_TILT, Math.min(MAX_TILT, g.angle))

        // ── Ball physics ───────────────────────────────────────────────
        g.ballVel += ROLL * GRAVITY * Math.sin(g.angle) * dt
        g.ballPos += g.ballVel * dt

        if (Math.abs(g.ballPos) > PLANK_LEN / 2 + BALL_R) {
          endGame()
        } else {
          // ── Object spawning ──────────────────────────────────────────
          g.spawnTimer -= dt
          const active = g.objects.filter(o => !o.gone).length
          if (g.spawnTimer <= 0 && active < 5) {
            g.objects.push(spawnObj())
            g.spawnTimer = 1.67 + Math.random() * 1.33
          }

          // ── Object physics ───────────────────────────────────────────
          for (const o of g.objects) {
            if (o.gone) continue

            if (!o.landed) {
              o.vy += GRAVITY * dt
              o.y  += o.vy * dt

              const dx = o.x - PLANK_CX, dy = o.y - PLANK_CY
              const s    =  dx * cosA + dy * sinA
              const perp =  dx * sinA - dy * cosA
              const contact = PLANK_H / 2 + o.radius
              const perpNext = perp - o.vy * cosA * dt

              if (Math.abs(s) <= PLANK_LEN / 2 && perp >= contact && perpNext <= contact) {
                o.landed   = true
                o.plankPos = s
                o.plankVel = 0
              }

              if (o.y > CH + o.radius) o.gone = true
            } else {
              o.plankVel += ROLL * GRAVITY * Math.sin(g.angle) * dt
              o.plankPos += o.plankVel * dt
              if (Math.abs(o.plankPos) > PLANK_LEN / 2 + o.radius) o.gone = true
            }
          }

          if (g.objects.length > 20) g.objects = g.objects.filter(o => !o.gone)

          g.elapsed = (Date.now() - g.startMs) / 1000
          setElapsed(g.elapsed)
        }
      }

      drawScene(ctx, phaseRef.current, g.angle, g.ballPos, g.elapsed, g.objects)
      rafRef.current = requestAnimationFrame(loop)
    }

    drawScene(ctx, 'idle', 0, 0, 0, [])
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const start = () => {
      if (phaseRef.current !== 'idle') return
      const g = gameRef.current
      g.angle = 0; g.omega = 0
      g.ballPos = 0; g.ballVel = (Math.random() - 0.5) * 40
      g.startMs = Date.now(); g.elapsed = 0
      g.objects = []; g.spawnTimer = 2
      lastMsRef.current = undefined
      phaseRef.current = 'playing'
      setPhase('playing'); setElapsed(0)
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

  useEffect(() => {
    document.title = 'Balance'
    return () => { document.title = 'James' }
  }, [])

  const handleRestart = () => {
    phaseRef.current = 'idle'
    keysRef.current  = { left: false, right: false }
    const g = gameRef.current
    g.angle = 0; g.omega = 0; g.ballPos = 0; g.ballVel = 0
    g.elapsed = 0; g.objects = []; g.spawnTimer = 3
    lastMsRef.current = undefined
    setPhase('idle'); setElapsed(0); setCopied(false)
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
        {phase === 'playing' && <div className="bl-live-time">{elapsed.toFixed(2)}s</div>}
      </div>

      <div className="bl-canvas-wrap">
        <canvas ref={canvasRef} style={{ width: CW, height: CH }} className="bl-canvas" />
        {phase === 'gameover' && (
          <div className="bl-overlay">
            <div className="bl-overlay__inner">
              <div className="bl-overlay__label">Time balanced</div>
              <div className="bl-overlay__time">{finalTime.toFixed(2)}s</div>
              <div className="bl-overlay__actions">
                <button
                  className={`ag-btn ag-btn--share${copied ? ' ag-btn--copied' : ''}`}
                  onClick={handleShare}
                >{copied ? '✓ Copied!' : '📋 Share my time'}</button>
                <button className="ag-btn ag-btn--restart" onClick={handleRestart}>Try again</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="bl-hint">Hold  <kbd>←</kbd>  or  <kbd>→</kbd>  to tilt the plank</p>
    </div>
  )
}
