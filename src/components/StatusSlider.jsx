const STATUSES = [
  { id: 'work',       label: 'At Work',           emoji: '💼' },
  { id: 'home',       label: 'At Home',            emoji: '🏠' },
  { id: 'volleyball', label: 'Playing Volleyball', emoji: '🏐' },
]

// Change this to 'work' | 'home' | 'volleyball' to update the current status
const CURRENT_STATUS = 'work'

export default function StatusSlider() {
  const currentIndex = STATUSES.findIndex(s => s.id === CURRENT_STATUS)
  const current = STATUSES[currentIndex]

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
              className="relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl z-10"
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

      <p className="text-gray-500 text-xs text-center mt-3">
        {current.emoji} James is currently <span className="text-gray-400 font-medium">{current.label.toLowerCase()}</span>
      </p>
    </section>
  )
}
