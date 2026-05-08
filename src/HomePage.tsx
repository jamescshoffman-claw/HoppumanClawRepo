import { useState, useEffect, useRef } from 'react'

const ACCENT = '#c5613f'

const PROJECTS = [
  {
    id: 'p1',
    title: 'TikTok (600k followers)',
    blurb: 'Short videos and experiments on TikTok.',
    year: '2026',
    tags: ['video', 'social'],
    link: 'https://www.tiktok.com/@hoppuman',
    image: '/images/tiktok.png',
  },
  {
    id: 'p2',
    title: 'Country Study',
    blurb: 'Name all the countries of Europe, Asia, and South America on an interactive map.',
    year: '2025',
    tags: ['geography', 'learning'],
    link: '/countrystudy',
    image: '/images/world-map.svg',
    internal: true,
  },
  {
    id: 'p8',
    title: 'Balance',
    blurb: 'Use arrow keys to keep a ball balanced on a tilting plank. How long can you last?',
    year: '2026',
    tags: ['game', 'physics'],
    link: '/balance',
    image: '/images/balance-game.svg',
    internal: true,
  },
  {
    id: 'p7',
    title: 'Animal Showdown',
    blurb: 'Guess which animal has more in the world. How long can you keep your streak?',
    year: '2026',
    tags: ['game', 'trivia'],
    link: '/animals',
    image: '/images/tiger-or-bear.svg',
    internal: true,
  },
  {
    id: 'p3',
    title: 'HoppuHabit',
    blurb: 'A habit-tracking app I built — available on the App Store.',
    year: '2025',
    tags: ['app', 'ios'],
    link: 'https://apps.apple.com/us/app/hoppuhabit/id6749086418',
    image: '/images/hoppuhabit.png',
  },
  {
    id: 'p4',
    title: 'OpenClaw',
    blurb: "An AI agent running 24/7 on a Mac mini at home, connected to my iMessage.",
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
    year: '2026',
    tags: ['ai', 'agent', 'imessage'],
    link: 'https://openclaw.ai',
    image: '/images/openclaw.svg',
  },
  {
    id: 'p5',
    title: 'GitHub (250 stars)',
    blurb: "Various projects I've made and shared online for others to use.",
    year: '',
    tags: ['code', 'open-source'],
    link: 'https://github.com/hoppuman/TikTokHacks/tree/master',
    image: '/images/github.svg',
  },
  {
    id: 'p6',
    title: 'The Trade Desk',
    blurb: 'Worked at The Trade Desk from 2018–2026.',
    year: '2018–2026',
    tags: ['work', 'adtech'],
    link: 'https://www.thetradedesk.com/',
    image: '/images/thetradedesk.png',
  },
] as const

const HOBBIES = [
  {
    id: 'h1',
    title: 'Clues by Sam',
    blurb: 'Daily detective puzzles by Sam — a favorite ritual.',
    year: '',
    tags: ['puzzle', 'daily'],
    link: 'https://cluesbysam.com/',
    image: '/images/detective.png',
  },
  {
    id: 'h2',
    title: 'Dune: Imperium Uprising',
    blurb: 'A favorite board game — strategy, spice, and intrigue.',
    year: '',
    tags: ['board game', 'strategy'],
    link: 'https://boardgamegeek.com/boardgame/397598/dune-imperium-uprising',
    image: '/images/dune.svg',
  },
  {
    id: 'h3',
    title: 'Jump Training',
    blurb: 'My goal is to dunk a basketball. Here is where I am.',
    stats: [
      ['Max Squat', '285'],
      ['Current Vertical', '39 inches'],
      ['Current Weight', '165 lbs'],
      ['Current Height', "6'0"],
    ],
    year: '',
    tags: ['gym', 'lifting'],
    link: '',
    image: '/images/dumbbell.svg',
  },
] as const

type Item = (typeof PROJECTS)[number] | (typeof HOBBIES)[number]

// ── Thumbnail ─────────────────────────────────────────────────────────────

function Thumb({ item }: { item: Item }) {
  const isSvgIcon = /\.(svg)$/.test(item.image) && !/world-map|tiger-or-bear|openclaw|dune|balance-game/.test(item.image)
  return (
    <img
      src={item.image}
      alt={item.title}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: isSvgIcon ? 'contain' : 'cover',
        background: isSvgIcon ? '#fff8e7' : 'transparent',
        padding: isSvgIcon ? '12%' : 0,
        boxSizing: 'border-box',
      }}
    />
  )
}

// ── Tile ──────────────────────────────────────────────────────────────────

function Tile({ item, expanded, onToggle }: { item: Item; expanded: boolean; onToggle: (id: string) => void }) {
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

// ── Expanded panel ────────────────────────────────────────────────────────

function ExpandedPanel({ item, onClose }: { item: Item; onClose: () => void }) {
  const p = item as Record<string, unknown>
  const link = item.link as string
  const internal = ('internal' in item && item.internal) as boolean
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  return (
    <div className="panel" ref={panelRef}>
      <div className="panel__inner">
        <div className="panel__media"><Thumb item={item} /></div>
        <div className="panel__body">
          {item.year && <div className="panel__meta">{item.year}</div>}
          <h2 className="panel__title">{item.title}</h2>
          <p className="panel__blurb">{(p.longBlurb as string | undefined) ?? item.blurb}</p>

          {Array.isArray(p.useCases) && (
            <div className="panel__section">
              <div className="panel__sec-label">Use Cases</div>
              <ul className="panel__usecases">
                {(p.useCases as string[]).map((u, i) => (
                  <li key={i}>
                    <span className="panel__arrow" style={{ color: ACCENT }}>→</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(p.stats) && (
            <div className="panel__section">
              <div className="panel__sec-label">Stats</div>
              <dl className="panel__stack">
                {(p.stats as [string, string][]).map(([k, v], i) => (
                  <div className="panel__stack-row" key={i}>
                    <dt>{k}</dt><dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {Array.isArray(p.stack) && (
            <div className="panel__section">
              <div className="panel__sec-label">Stack</div>
              <dl className="panel__stack">
                {(p.stack as [string, string][]).map(([k, v], i) => (
                  <div className="panel__stack-row" key={i}>
                    <dt>{k}</dt><dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="panel__actions">
            {link && (
              <a
                href={link}
                target={internal ? '_self' : '_blank'}
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

// ── Section ───────────────────────────────────────────────────────────────

const COLS = 4

function Section({
  title,
  items,
  openId,
  onToggle,
  onClose,
}: {
  title: string
  items: readonly Item[]
  openId: string | null
  onToggle: (id: string) => void
  onClose: () => void
}) {
  const rowOf = (idx: number) => Math.floor(idx / COLS)
  const expandedItem = openId != null ? items.find(p => p.id === openId) ?? null : null
  const expandedRow = openId != null ? rowOf(items.findIndex(p => p.id === openId)) : -1

  const rows: (typeof items[number])[][] = []
  for (let i = 0; i < items.length; i += COLS) rows.push([...items].slice(i, i + COLS))

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

// ── Now drawer ────────────────────────────────────────────────────────────

function NowDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`now ${open ? 'now--open' : ''}`} aria-hidden={!open}>
      <div className="now__head">
        <span className="now__label">Now</span>
        <button className="now__close" onClick={onClose}>✕</button>
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

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [nowOpen, setNowOpen] = useState(false)

  const onToggle = (id: string) => setOpenId(prev => prev === id ? null : id)
  const onClose = () => setOpenId(null)

  return (
    <div className="app">
      <header className="header">
        <div className="header__row">
          <h1 className="brand">James</h1>
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
        <Section title="Projects" items={PROJECTS} openId={openId} onToggle={onToggle} onClose={onClose} />
        <Section title="Hobbies"  items={HOBBIES}  openId={openId} onToggle={onToggle} onClose={onClose} />
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
