import { useState } from 'react'
import DinoGame from './components/DinoGame'
import StatusSlider from './components/StatusSlider'

const PASSWORD_HASH = 'e4d4fd2cfe768245519a86e8840dda4931fae090cc5bc588c7d943749665d16e'

async function hashInput(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  const handleUnlockSubmit = async (e) => {
    e.preventDefault()
    const hashed = await hashInput(input)
    if (hashed === PASSWORD_HASH) {
      setUnlocked(true)
      setShowPrompt(false)
      setInput('')
    } else {
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #030712 0%, #0a1628 50%, #030712 100%)' }}>

      <div className="relative max-w-3xl mx-auto px-5 py-20 space-y-6">

        {/* ── Hero ── */}
        <header className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              James
            </span>
          </h1>
          <div className="flex items-center justify-center gap-6 pt-1">
            <span className="text-gray-500 text-sm font-medium">6'0"</span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-500 text-sm font-medium">165 lbs</span>
          </div>
        </header>

        {/* ── About ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-gray-300 leading-relaxed text-base">
            Hey — I'm <strong className="text-white font-semibold">James</strong>. This is where I will share what I am up to lately and what I'm focused on.
          </p>
        </section>

        {/* ── Status Slider ── */}
        <StatusSlider unlocked={unlocked} />

        {/* ── Claude Code / OpenClaw ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">Currently Working On</h2>

          <p className="text-white font-semibold text-xl mb-2">OpenClaw</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            I've been heads down on <strong className="text-white">OpenClaw</strong> — an AI agent running 24/7 on a Mac mini at home, connected to my iMessage.
          </p>

          <p className="text-white text-sm font-semibold mb-3">Use Cases</p>
          <ul className="text-gray-400 text-sm space-y-2 mb-6 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span><strong className="text-white">Updating Notion</strong> — I text the bot and it logs things directly into my Notion workspace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span><strong className="text-white">Calendar management</strong> — my friends text the bot to add events to my Google Calendar, the AI handles it automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span><strong className="text-white">Writing, pushing, and deploying code</strong> — this website was updated from my phone</span>
            </li>
          </ul>

          <p className="text-white text-sm font-semibold mb-3">Stack</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {[
              ['Web Hosting', 'GitHub Pages'],
              ['Domain', 'Squarespace'],
              ['Database', 'Supabase · PostgreSQL'],
              ['Web Scraper', 'Brave Search API'],
              ['Phone Number', 'Mint Mobile'],
              ['Messaging Server', 'BlueBubbles'],
              ['Notion Sync', 'Notion API'],
              ['Calendar Sync', 'Google Calendar API'],
              ['LLM', 'Claude (Anthropic)'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border border-white/5 rounded-lg px-3 py-2 bg-white/[0.03]">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-300 font-medium">{value}</span>
              </div>
            ))}
          </div>

          <a
            href="https://openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Check out OpenClaw
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </a>
        </section>

        {/* ── Hobbies ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-5">Hobbies</h2>

          <div className="space-y-5">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Currently Reading</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.goodreads.com/book/show/44767458-dune"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white hover:text-emerald-300 text-sm font-medium transition-colors"
                  >
                    Dune — Frank Herbert
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.goodreads.com/book/show/6289420-a-practical-guide-to-quantitative-finance-interviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white hover:text-emerald-300 text-sm font-medium transition-colors"
                  >
                    A Practical Guide to Quantitative Finance Interviews
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Favorite Daily Puzzle</p>
              <a
                href="https://cluesbysam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                Clues by Sam
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </a>
              <p className="text-gray-400 text-xs mt-1">Daily logic puzzle where you deterministically deduce who is good and bad based on hints.</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Currently Learning</p>
              <p className="text-white text-sm">Probability and statistics</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Sports</p>
              <p className="text-white text-sm">Volleyball, sometimes basketball</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Favorite Board Game</p>
              <a
                href="https://boardgamegeek.com/boardgame/397598/dune-imperium-uprising"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                Dune: Imperium Uprising
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── Dino Game ── */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Beat The High Score</h2>
          </div>
          <DinoGame />
        </section>

        {/* ── Jeopardy ── */}
        <a
          href="/game/index.html"
          className="glass-card p-6 animate-slide-up flex items-center justify-between group no-underline"
          style={{ animationDelay: '0.3s', display: 'flex' }}
        >
          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-1">Play</h2>
            <p className="text-white font-semibold text-xl mb-1">Jeopardy!</p>
            <p className="text-gray-400 text-sm">Made this for a dinner party with friends</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="text-emerald-400 group-hover:translate-x-1 transition-transform" aria-hidden>
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </a>

        {/* ── Lock ── */}
        <div className="flex flex-col items-center gap-3">
          {unlocked ? (
            <button
              onClick={() => setUnlocked(false)}
              className="text-emerald-500/60 hover:text-emerald-400 transition-colors text-xs flex items-center gap-1"
              title="Lock"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
              </svg>
              unlocked
            </button>
          ) : (
            <button
              onClick={() => setShowPrompt(p => !p)}
              className="text-gray-700 hover:text-gray-500 transition-colors"
              title="Unlock to edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            </button>
          )}
          {showPrompt && !unlocked && (
            <form
              onSubmit={handleUnlockSubmit}
              className={`flex gap-2 justify-center ${shake ? 'animate-wiggle' : ''}`}
            >
              <input
                autoFocus
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="password"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 w-32"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg transition-colors"
              >
                Unlock
              </button>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="text-center text-gray-700 text-xs pt-4 pb-8 space-y-1">
          <p>James · {new Date().getFullYear()}</p>
          <p>Built with React + Vite + Tailwind · powered by Claude Code</p>
        </footer>

      </div>
    </div>
  )
}
