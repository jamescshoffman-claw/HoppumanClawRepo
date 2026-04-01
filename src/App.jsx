import { useState } from 'react'
import DinoGame from './components/DinoGame'
import DachshundGallery from './components/DachshundGallery'

const SECTIONS = [
  { id: 'about', label: 'ABOUT' },
  { id: 'openclaw', label: 'OPENCLAW' },
  { id: 'dune', label: 'DUNE: IMPERIUM UPRISING' },
  { id: 'dino', label: 'DINO RUNNER' },
  { id: 'dachshunds', label: 'DACHSHUNDS' },
]

function SectionContent({ id }) {
  if (id === 'about') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 640 }}>
        <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 20, fontWeight: 400, margin: '0 0 20px 0' }}>
          Hey — I am James. This is where I will share what I am up to lately and what I am focused on.
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#FF0000', margin: 0 }}>
          6&apos;0&quot; · 165 LBS
        </p>
      </div>
    )
  }

  if (id === 'openclaw') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 640 }}>
        <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 24, fontWeight: 400, margin: '0 0 24px 0' }}>
          I&apos;ve been ham on OpenClaw. It built most of this website. I&apos;m running it on a Mac mini to
          connect Claude to my iMessage. This means: my friends can text me to add events to my
          Google Calendar, I update this website by texting my phone, the whole thing runs on my
          Mac mini at home 24/7.
        </p>
        <a
          href="https://openclaw.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#ffffff',
            backgroundColor: '#FF0000',
            padding: '10px 18px',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          OPENCLAW.AI ↗
        </a>
      </div>
    )
  }

  if (id === 'dune') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 640 }}>
        <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 400, margin: 0 }}>
          I&apos;ve been pretty obsessed with Dune: Imperium Uprising lately. It&apos;s a deck-building worker
          placement game and it&apos;s genuinely so good. Every game feels different — you&apos;re managing
          spice, troops, influence across four factions, and trying not to get stomped before you
          can pull off whatever combo you&apos;ve been cooking. The Uprising expansion adds a whole naval
          combat layer which sounds complicated but ends up being really satisfying.
        </p>
      </div>
    )
  }

  if (id === 'dino') {
    return (
      <div style={{ padding: '24px 16px' }}>
        <DinoGame />
      </div>
    )
  }

  if (id === 'dachshunds') {
    return (
      <div style={{ padding: '24px 16px' }}>
        <DachshundGallery />
      </div>
    )
  }

  return null
}

export default function App() {
  const [active, setActive] = useState(null)
  const activeSection = SECTIONS.find((s) => s.id === active)

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#000000', display: 'flex', flexDirection: 'column' }}>

      {/* Red top bar */}
      <div style={{ backgroundColor: '#FF0000', height: 6, flexShrink: 0 }} />

      {/* Header */}
      <header style={{
        borderBottom: '3px solid #000000',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setActive(null)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span style={{
            fontSize: 'clamp(26px, 6vw, 44px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#000000',
            textTransform: 'uppercase',
            lineHeight: 1,
            display: 'block',
          }}>
            JAMES
          </span>
        </button>

        {active && (
          <button
            onClick={() => setActive(null)}
            style={{
              background: 'none',
              border: '2px solid #000000',
              padding: '6px 12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#000000',
            }}
          >
            ← BACK
          </button>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {!active ? (
          <nav>
            {SECTIONS.map((section, i) => (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF0000'
                  e.currentTarget.querySelector('span').style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.querySelector('span').style.color = '#000000'
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid #000000',
                  borderTop: i === 0 ? '2px solid #000000' : 'none',
                  padding: '22px 16px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  backgroundColor: '#ffffff',
                }}
              >
                <span style={{
                  fontSize: 'clamp(20px, 5vw, 34px)',
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  display: 'block',
                  color: '#000000',
                }}>
                  {section.label}
                </span>
              </button>
            ))}
          </nav>
        ) : (
          <div>
            <div style={{
              borderBottom: '2px solid #000000',
              padding: '14px 16px',
              backgroundColor: '#000000',
            }}>
              <span style={{
                fontSize: 'clamp(16px, 4vw, 26px)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#ffffff',
                lineHeight: 1,
                display: 'block',
              }}>
                {activeSection.label}
              </span>
            </div>
            <SectionContent id={active} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid #000000',
        padding: '10px 16px',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#000000',
        }}>
          JAMES © {new Date().getFullYear()}
        </span>
      </footer>

    </div>
  )
}
