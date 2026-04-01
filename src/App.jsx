import DinoGame from './components/DinoGame'
import DachshundGallery from './components/DachshundGallery'

export default function App() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #030712 0%, #0a1628 50%, #030712 100%)' }}>

      <div className="relative max-w-3xl mx-auto px-5 py-20 space-y-12">

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
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            What do
          </p>
        </header>

        {/* ── About ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-gray-300 leading-relaxed text-base">
            Hey — I'm <strong className="text-white font-semibold">James</strong>. This is where I will share what I am up to lately and what I'm focused on.
          </p>

        </section>

        {/* ── Claude Code / OpenClaw ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">Currently Working On</h2>

          <p className="text-white font-semibold text-xl mb-2">OpenClaw</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            I've been ham on <strong className="text-white">OpenClaw</strong>. It built most of this website.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            I'm running it on a Mac mini to connect Claude to my iMessage. This means:
          </p>
          <ul className="text-gray-400 text-sm space-y-2 mb-5 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span><strong className="text-white">My friends can text me</strong> to add events to my Google Calendar — the AI handles it automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span><strong className="text-white">I update this website by texting my phone</strong> — no laptop required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span>The whole thing runs on my Mac mini at home, 24/7</span>
            </li>
          </ul>

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

        {/* ── Dune Imperium ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">also on my mind</h2>
          <p className="text-white font-semibold text-xl mb-2">Dune: Imperium Uprising 🪱</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            I've been pretty obsessed with Dune: Imperium Uprising lately. It's a deck-building worker placement game and it's genuinely so good. Every game feels different — you're managing spice, troops, influence across four factions, and trying not to get stomped before you can pull off whatever combo you've been cooking.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            The Uprising expansion adds a whole naval combat layer which sounds complicated but ends up being really satisfying. Highly recommend if you're into strategy games at all.
          </p>
        </section>

        {/* ── Dino Game ── */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="mb-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Dino Runner</h2>
          </div>
          <DinoGame />
        </section>

        {/* ── Dachshunds ── */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Daily Dachshunds</h2>
          </div>
          <DachshundGallery />
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-gray-700 text-xs pt-4 pb-8 space-y-1">
          <p>James · {new Date().getFullYear()}</p>
          <p>Built with React + Vite + Tailwind · powered by Claude Code</p>
        </footer>

      </div>
    </div>
  )
}
