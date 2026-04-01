import DinoGame from './components/DinoGame'
import DachshundGallery from './components/DachshundGallery'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-48 -left-32 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 py-20 space-y-12">

        {/* ── Hero ── */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-widest uppercase mb-2">
            ● Live
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            James{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Hoffman
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Builder · Tinkerer · Enjoyer of long dogs
          </p>
        </header>

        {/* ── About ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">About</h2>
          <p className="text-gray-300 leading-relaxed text-base">
            Hey — I'm <strong className="text-white font-semibold">James Hoffman</strong>. This is my personal corner of the internet.
            I use it to share what I've been building, experimenting with, and generally obsessing over lately.
            Expect projects ranging from web apps and games to whatever rabbit hole I fell into this week.
          </p>
          <p className="text-gray-500 text-sm mt-3">
            Check back often — this page updates as new things get shipped.
          </p>
        </section>

        {/* ── Jeopardy CTA ── */}
        <section className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">Featured Project</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold text-xl mb-1">Jeopardy Game</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                A fully playable Jeopardy-style game built from scratch. Categories, Daily Doubles, Final Jeopardy — the whole deal.
              </p>
            </div>
            <a
              href="/game/"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
            >
              Play Now
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>
          </div>
        </section>

        {/* ── Dino Game ── */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Dino Runner</h2>
            <span className="text-gray-600 text-xs">space · click · tap to jump  ·  double jump supported</span>
          </div>
          <DinoGame />
        </section>

        {/* ── Dachshunds ── */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Daily Dachshunds</h2>
            <span className="text-gray-600 text-xs">via dog.ceo · refreshes on load</span>
          </div>
          <DachshundGallery />
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-gray-700 text-xs pt-4 pb-8 space-y-1">
          <p>James Hoffman · {new Date().getFullYear()}</p>
          <p>Built with React + Vite + Tailwind</p>
        </footer>

      </div>
    </div>
  )
}
