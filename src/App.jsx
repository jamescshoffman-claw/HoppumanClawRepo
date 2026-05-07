import { useState, useEffect } from 'react'

const ACCENT = '#c5613f'

// ---------- Data ----------

const PROJECTS = [
  {
    id: 'p1',
    title: 'TikTok (600k followers)',
    blurb: 'Short videos and experiments on TikTok.',
    status: 'Live',
    year: '2026',
    tags: ['video', 'social'],
    link: 'https://www.tiktok.com/@hoppuman',
    image: '/images/tiktok.png',
  },
  {
    id: 'p2',
    title: 'Country Study',
    blurb: 'See if you can name all the countries of each continent.',
    status: 'Live',
    year: '2025',
    tags: ['geography', 'learning'],
    link: '/countrystudy/index.html',
    image: '/images/world-map.svg',
  },
  {
    id: 'p3',
    title: 'HoppuHabit',
    blurb: 'A habit-tracking app I built — available on the App Store.',
    status: 'Live',
    year: '2025',
    tags: ['app', 'ios'],
    link: 'https://apps.apple.com/us/app/hoppuhabit/id6749086418',
    image: '/images/hoppuhabit.png',
  },
  {
    id: 'p4',
    title: 'OpenClaw',
    blurb: 'An AI agent running 24/7 on a Mac mini at home, connected to my iMessage.',
    longBlurb: "I've been heads down on OpenClaw — an AI agent running 24/7 on a Mac mini at home, connected to my iMessage.",
    useCases: [
      'Updating Notion — I text the bot and it logs things directly into my Notion workspace',
      'Calendar management — my friends text the bot to add events to my Google Calendar, the AI handles it automatically',
      'Writing, pushing, and deploying code — this website was updated from my phone',
    ],
    stack: [
      ['Web Hosting', 'GitHub Pages'],
      ['Domain', 'Squarespace'],
      ['Database', 'Supabase · PostgreSQL'],
      ['Web Scraper', 'Brave Search API'],
      ['Phone Number', 'Mint Mobile'],
      ['Messaging Server', 'BlueBubbles'],
      ['Notion Sync', 'Notion API'],
      ['Calendar Sync', 'Google Calendar API'],
      ['LLM', 'Claude (Anthropic)'],
    ],
    status: 'In progress',
    year: '2026',
    tags: ['ai', 'agent', 'imessage'],
    link: 'https://openclaw.ai',
    image: '/images/openclaw.svg',
  },
  {
    id: 'p5',
    title: 'GitHub (250 stars)',
    blurb: 'Various projects on GitHub — including TikTokHacks (250 stars).',
    status: 'Live',
    year: '',
    tags: ['code', 'open-source'],
    link: 'https://github.com/hoppuman/TikTokHacks/tree/master',
    image: '/images/github.svg',
  },
  {
    id: 'p6',
    title: 'The Trade Desk',
    blurb: 'Worked at The Trade Desk from 2018–2026.',
    status: 'Live',
    year: '2018–2026',
    tags: ['work', 'adtech'],
    link: 'https://www.thetradedesk.com/',
    image: '/images/thetradedesk.png',
  },
]

const HOBBIES = [
  {
    id: 'h1',
    title: 'Clues by Sam',
    blurb: 'Daily detective puzzles by Sam — a favorite ritual.',
    status: 'Live',
    year: '',
    tags: ['puzzle', 'daily'],
    link: 'https://cluesbysam.com/',
    image: '/images/detective.png',
  },
  {
    id: 'h2',
    title: 'Dune: Imperium Uprising',
    blurb: 'A favorite board game — strategy, spice, and intrigue.',
    status: 'Live',
    year: '',
    tags: ['board game', 'strategy'],
    link: 'https://boardgamegeek.com/boardgame/397598/dune-imperium-uprising',
    image: '/images/dune.svg',
  },
  {
    id: 'h3',
    title: 'Jump Training',
    blurb: 'My goal is to be able to dunk a basketball. Currently this is where I am.',
    stats: [
      ['Max Squat', '285'],
      ['Current Vertical', '39 inches'],
      ['Current Weight', '165 lbs'],
      ['Current Height', "6'0"],
    ],
    status: 'In progress',
    year: '',
    tags: ['gym', 'lifting'],
    link: '',
    image: '/images/dumbbell.svg',
  },
]

// ---------- Thumbnail ----------

function Thumb({ item }) {
  if (item?.image) {
    const isContain = /\.svg$/.test(item.image) && !/world-map/.test(item.image)
    return (
      <img
        src={item.image}
        alt={item.title}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: isContain ? 'contain' : 'cover',
          background: isContain ? '#fff8e7' : 'transparent',
          padding: isContain ? '12%' : 0,
          boxSizing: 'border-box',
        }}
      />
    )
  }
  return <PlaceholderThumb id={item.id} />
}

const PLACEHOLDER_HUES = [25, 35, 18, 45, 12, 30, 50, 22, 38, 28, 42]

function PlaceholderThumb({ id }) {
  const seed = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = PLACEHOLDER_HUES[seed % PLACEHOLDER_HUES.length]
  const bg = `oklch(0.78 0.04 ${hue})`
  const fg = `oklch(0.68 0.06 ${hue})`
  const ink = `oklch(0.30 0.04 ${hue})`
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <pattern id={`stripes-${id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill={bg} />
          <rect width="7" height="14" fill={fg} />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#stripes-${id})`} />
      <text x="20" y="380" fill={ink} style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 14, letterSpacing: '0.08em' }}>
        IMG / {id}
      </text>
    </svg>
  )
}

// ---------- Tile ----------

function Tile({ item, expanded, onToggle }) {
  return (
    <button
      className={`tile ${expanded ? 'tile--expanded' : ''}`}
      onClick={() => onToggle(item.id)}
      aria-expanded={expanded}
    >
      <div className="tile__thumb">
        <Thumb item={item} />
        {expanded && <div className="tile__active-dot" style={{ background: ACCENT }} />}
      </div>
      <div className="tile__caption">
        <span className="tile__title">{item.title}</span>
        <span className="tile__year">{item.year}</span>
      </div>
    </button>
  )
}

// ---------- Expanded panel ----------

function ExpandedPanel({ item, onClose }) {
  if (!item) return null
  return (
    <div className="panel" role="region" aria-label={`${item.title} details`}>
      <div className="panel__inner">
        <div className="panel__media">
          <Thumb item={item} />
        </div>
        <div className="panel__body">
          {item.year && (
            <div className="panel__meta">
              <span>{item.year}</span>
            </div>
          )}
          <h2 className="panel__title">{item.title}</h2>
          <p className="panel__blurb">{item.longBlurb || item.blurb}</p>

          {item.useCases && (
            <div className="panel__section">
              <div className="panel__sec-label">Use Cases</div>
              <ul className="panel__usecases">
                {item.useCases.map((u, i) => (
                  <li key={i}>
                    <span className="panel__arrow" style={{ color: ACCENT }}>→</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.stats && (
            <div className="panel__section">
              <div className="panel__sec-label">Stats</div>
              <dl className="panel__stack">
                {item.stats.map(([k, v], i) => (
                  <div className="panel__stack-row" key={i}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {item.stack && (
            <div className="panel__section">
              <div className="panel__sec-label">Stack</div>
              <dl className="panel__stack">
                {item.stack.map(([k, v], i) => (
                  <div className="panel__stack-row" key={i}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="panel__actions">
            {item.link && (
              <a
                href={item.link}
                target={item.link.startsWith('/') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="panel__link panel__link--primary"
                style={{ background: ACCENT }}
              >
                Visit →
              </a>
            )}
            <button className="panel__close" onClick={onClose}>Close ✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Section ----------

const COLS = 4

function Section({ title, items, openId, onToggle, onClose }) {
  const rowOf = (idx) => Math.floor(idx / COLS)
  const expandedItem = openId != null ? items.find(p => p.id === openId) : null
  const expandedIdx = openId != null ? items.findIndex(p => p.id === openId) : -1
  const expandedRow = expandedIdx >= 0 ? rowOf(expandedIdx) : -1

  const rows = []
  for (let i = 0; i < items.length; i += COLS) rows.push(items.slice(i, i + COLS))

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        <span className="section__count">{String(items.length).padStart(2, '0')}</span>
      </div>
      <div className="grid">
        {rows.map((row, rIdx) => (
          <>
            <div className="grid__row" key={`row-${rIdx}`}>
              {row.map(p => (
                <Tile key={p.id} item={p} expanded={openId === p.id} onToggle={onToggle} />
              ))}
              {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, k) => (
                <div key={`fill-${k}`} className="tile tile--empty" aria-hidden="true" />
              ))}
            </div>
            {expandedRow === rIdx && expandedItem && (
              <ExpandedPanel key={`panel-${rIdx}`} item={expandedItem} onClose={onClose} />
            )}
          </>
        ))}
      </div>
    </section>
  )
}

// ---------- Now drawer ----------

function NowDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`now ${open ? 'now--open' : ''}`} aria-hidden={!open}>
      <div className="now__head">
        <span className="now__label">Now</span>
        <button className="now__close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <p className="now__date">May 2026</p>
      <ul className="now__list">
        <li><span className="now__bullet" style={{ background: ACCENT }} />Working on a few new projects.</li>
        <li><span className="now__bullet" style={{ background: ACCENT }} />Solving Clues by Sam every morning.</li>
        <li><span className="now__bullet" style={{ background: ACCENT }} />Open to small collaborations — say hi.</li>
      </ul>
    </div>
  )
}

// ---------- App ----------

export default function App() {
  const [openId, setOpenId] = useState(null)
  const [nowOpen, setNowOpen] = useState(false)

  const onToggle = (id) => setOpenId(prev => prev === id ? null : id)
  const onClose = () => setOpenId(null)

  return (
    <div className="app">
      <header className="header">
        <div className="header__row">
          <div>
            <h1 className="brand">James</h1>
          </div>
          <button
            className="header__now"
            onClick={() => setNowOpen(v => !v)}
            aria-pressed={nowOpen}
          >
            <span className="header__now-dot" style={{ background: ACCENT }} />
            Now
          </button>
        </div>
      </header>

      <main>
        <Section
          title="Projects"
          items={PROJECTS}
          openId={openId}
          onToggle={onToggle}
          onClose={onClose}
        />
        <Section
          title="Hobbies"
          items={HOBBIES}
          openId={openId}
          onToggle={onToggle}
          onClose={onClose}
        />
      </main>

      <footer className="footer">
        <span>© James, {new Date().getFullYear()}</span>
        <span className="footer__sep">·</span>
        <a href="mailto:james.cs.hoffman@gmail.com">james.cs.hoffman@gmail.com</a>
        <span className="footer__sep">·</span>
        <a href="https://www.linkedin.com/in/jhoffman1204/" target="_blank" rel="noopener noreferrer">linkedin</a>
        <span className="footer__sep">·</span>
        <a href="https://github.com/hoppuman" target="_blank" rel="noopener noreferrer">github</a>
      </footer>

      <NowDrawer open={nowOpen} onClose={() => setNowOpen(false)} />
    </div>
  )
}
