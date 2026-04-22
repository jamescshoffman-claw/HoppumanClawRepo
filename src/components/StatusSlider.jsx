import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://mrumapmwohcjyownhvoi.supabase.co'
const SUPABASE_KEY = 'sb_publishable_hLTIQ49G_GYQSfClMIDn6Q_0YKuUWq0'
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

const STATUSES = [
  { id: 'work',       label: 'At Work',           emoji: '💼' },
  { id: 'home',       label: 'At Home',            emoji: '🏠' },
  { id: 'volleyball', label: 'Playing Volleyball', emoji: '🏐' },
]

async function fetchStatus() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/status?select=value&id=eq.1`, { headers: HEADERS })
  const data = await res.json()
  return data[0]?.value ?? 'work'
}

async function saveStatus(value) {
  await fetch(`${SUPABASE_URL}/rest/v1/status?id=eq.1`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ value }),
  })
}

export default function StatusSlider({ unlocked }) {
  const [currentId, setCurrentId] = useState('work')

  useEffect(() => {
    fetchStatus().then(setCurrentId)
  }, [])

  const currentIndex = STATUSES.findIndex(s => s.id === currentId)

  const handleStatusClick = async (id) => {
    if (!unlocked) return
    setCurrentId(id)
    await saveStatus(id)
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

    </section>
  )
}
