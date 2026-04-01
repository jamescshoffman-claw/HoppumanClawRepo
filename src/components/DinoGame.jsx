import { useEffect, useRef } from 'react'

export default function DinoGame() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const GROUND = H - 36

    const state = {
      running: false,
      dead: false,
      score: 0,
      hiScore: 0,
      frame: 0,
      speed: 5,
      nextObs: 90,
    }

    const dino = {
      x: 60,
      y: GROUND - 44,
      w: 32,
      h: 44,
      vy: 0,
      jumps: 0,
    }

    let obstacles = []
    let animId = null

    function jump() {
      if (state.dead) { restart(); return }
      if (!state.running) { start(); return }
      if (dino.jumps < 2) {
        dino.vy = -13
        dino.jumps++
      }
    }

    function start() {
      state.running = true
      state.dead = false
      loop()
    }

    function restart() {
      state.score = 0
      state.frame = 0
      state.speed = 5
      state.nextObs = 90
      state.dead = false
      state.running = true
      obstacles = []
      dino.y = GROUND - dino.h
      dino.vy = 0
      dino.jumps = 0
      loop()
    }

    // Draw a simple pixel-art style dino
    function drawDino(x, y, w, h) {
      const onGround = dino.y >= GROUND - dino.h - 1
      const leg = Math.floor(state.frame / 5) % 2

      ctx.fillStyle = '#34d399'
      // body
      ctx.fillRect(x, y, w, h)
      // head bump
      ctx.fillRect(x + w - 6, y - 10, 12, 14)
      // eye
      ctx.fillStyle = '#064e3b'
      ctx.fillRect(x + w + 1, y - 6, 5, 5)
      // mouth
      ctx.fillStyle = '#34d399'
      ctx.fillRect(x + w - 2, y + 2, 10, 4)
      // arm
      ctx.fillStyle = '#34d399'
      ctx.fillRect(x + w - 10, y + h * 0.3, 10, 6)
      // legs
      ctx.fillStyle = '#34d399'
      if (onGround) {
        if (leg === 0) {
          ctx.fillRect(x + 4, y + h, 10, 10)
          ctx.fillRect(x + 16, y + h - 6, 10, 6)
        } else {
          ctx.fillRect(x + 4, y + h - 6, 10, 6)
          ctx.fillRect(x + 16, y + h, 10, 10)
        }
      } else {
        ctx.fillRect(x + 4, y + h, 10, 8)
        ctx.fillRect(x + 16, y + h, 10, 8)
      }
    }

    function drawCactus(obs) {
      const { x, y, w, h } = obs
      const stemW = Math.round(w * 0.35)
      const armH = Math.round(h * 0.28)
      const armY = y - Math.round(h * 0.62)

      ctx.fillStyle = '#4ade80'
      // Main stem
      ctx.fillRect(x + (w - stemW) / 2, y - h, stemW, h)
      // Left arm horizontal
      ctx.fillRect(x, armY, (w - stemW) / 2 + stemW / 2, stemW)
      // Left arm vertical
      ctx.fillRect(x, armY - armH, stemW, armH)
      // Right arm horizontal
      ctx.fillRect(x + (w + stemW) / 2 - stemW, armY, (w - stemW) / 2 + stemW / 2, stemW)
      // Right arm vertical
      ctx.fillRect(x + w - stemW, armY - armH, stemW, armH)
    }

    function drawHUD() {
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'right'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`HI  ${String(state.hiScore).padStart(5, '0')}`, W - 80, 22)
      ctx.fillStyle = '#e5e7eb'
      ctx.fillText(String(state.score).padStart(5, '0'), W - 15, 22)
    }

    function drawGround() {
      ctx.fillStyle = '#374151'
      ctx.fillRect(0, GROUND + 2, W, 2)
      ctx.fillStyle = '#1f2937'
      const spacing = 60
      for (let i = 0; i < W; i += spacing) {
        const x = ((i - (state.frame * state.speed * 0.5) % spacing) + spacing) % W
        ctx.fillRect(x, GROUND + 6, 20, 3)
        ctx.fillRect(x + 30, GROUND + 10, 10, 2)
      }
    }

    function drawIdleScreen() {
      ctx.clearRect(0, 0, W, H)
      drawGround()
      drawDino(dino.x, GROUND - dino.h, dino.w, dino.h)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('press space · click · tap  to start', W / 2, H / 2 - 8)
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      drawGround()

      // Physics
      dino.vy += 0.65
      dino.y += dino.vy
      if (dino.y >= GROUND - dino.h) {
        dino.y = GROUND - dino.h
        dino.vy = 0
        dino.jumps = 0
      }

      // Spawn obstacles
      state.frame++
      if (state.frame >= state.nextObs) {
        const h = 38 + Math.random() * 36
        const w = 28 + Math.random() * 14
        obstacles.push({ x: W + 10, y: GROUND, w, h })
        state.nextObs = state.frame + 55 + Math.floor(Math.random() * 75)
        state.speed = Math.min(14, state.speed + 0.12)
      }

      // Update + draw obstacles
      obstacles = obstacles.filter(o => o.x + o.w > -10)
      for (const obs of obstacles) {
        obs.x -= state.speed
        drawCactus(obs)

        // Collision (AABB with margin)
        const m = 7
        const collide =
          dino.x + m < obs.x + obs.w - m &&
          dino.x + dino.w - m > obs.x + m &&
          dino.y + m < obs.y &&
          dino.y + dino.h - m > obs.y - obs.h + m

        if (collide) {
          state.dead = true
          state.running = false
          if (state.score > state.hiScore) state.hiScore = state.score

          // Final frame
          drawDino(dino.x, dino.y, dino.w, dino.h)
          drawHUD()

          // Overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
          ctx.fillRect(W / 2 - 150, H / 2 - 38, 300, 80)
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'
          ctx.strokeRect(W / 2 - 150, H / 2 - 38, 300, 80)
          ctx.fillStyle = '#f87171'
          ctx.font = 'bold 20px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('G A M E  O V E R', W / 2, H / 2 - 8)
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px monospace'
          ctx.fillText('tap · click · space  to restart', W / 2, H / 2 + 18)
          return
        }
      }

      drawDino(dino.x, dino.y, dino.w, dino.h)

      state.score = Math.floor(state.frame / 6)
      drawHUD()

      animId = requestAnimationFrame(loop)
    }

    // Initial idle draw
    drawIdleScreen()

    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    const onClick = () => jump()
    const onTouch = (e) => { e.preventDefault(); jump() }

    window.addEventListener('keydown', onKey)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouch, { passive: false })

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouch)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={190}
      className="w-full cursor-pointer rounded-xl"
      style={{ background: 'rgba(0,0,0,0)', display: 'block' }}
    />
  )
}
