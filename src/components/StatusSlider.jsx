import { useState, useEffect } from 'react'

const STATUSES = [
  { id: 'work',       label: 'At Work',           emoji: '💼' },
  { id: 'home',       label: 'At Home',            emoji: '🏠' },
  { id: 'volleyball', label: 'Playing Volleyball', emoji: '🏐' },
]

const DEFAULT_STATUS = 'work'
const PASSWORD = 'boostedmonkey'
const STORAGE_KEY = 'james_status'

export default function StatusSlider() {
  const [currentId, setCurrentId] = useState(DEFAULT_STATUS)
  const [unlocked, setUnlocked] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  // Load persisted status on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && STATUSES.find(s => s.id === saved)) {
      setCurrentId(saved)
    }
  }, [])

  const currentIndex = STATUSES.findIndex(s => s.id === currentId)

  const handleStatusClick = (id) => {
    if (!unlocked) return
    setCurrentId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const handleUnlockSubmit = (e) => {
    e.preventDefault()
    if (input === PASSWORD) {
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
    <section className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
      <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-4">Right Now</p>

      {/* Track */}
      <div className="relative flex items-center bg-white/5 rounded-2xl p-1 gap-1">
        {/* Sliding highlight */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 transition-all duration-500 ease-in-out"
          style={{
            left: `calc(${currentIndex} * (100% / ${STATUSES.length}) + 4px)`,
            width: `calc(100% / ${STATUSES.length} - 8px)`,
          }}
        />

        {STATUSES.map((s, i) => {
          const isActive = i === currentIndex
          return (
            <div
              key={s.id}
              onClick={() => handleStatusClick(s.id)}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl z-10 transition-opacity duration-200 ${
                unlocked ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              }`}
            >
              <span className="text-lg leading-none">{s.emoji}</span>
              <span
                className={`text-xs font-medium transition-colors duration-300 text-center leading-tight ${
                  isActive ? 'text-emerald-300' : 'text-gray-600'
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Lock button */}
      <div className="flex justify-center mt-3">
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
      </div>

      {/* Password prompt */}
      {showPrompt && !unlocked && (
        <form
          onSubmit={handleUnlockSubmit}
          className={`mt-3 flex gap-2 justify-center ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}
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
    </section>
  )
}
