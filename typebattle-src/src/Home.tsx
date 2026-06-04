import { navigate } from './App'

export default function Home() {
  return (
    <div className="home">
      <h1>Type Race</h1>
      <p className="tagline">
        Test your typing speed — or drop a challenge link in the group chat and
        find out who really has the fastest fingers.
      </p>

      <div className="mode-grid">
        <button className="mode-card" onClick={() => navigate('/single')}>
          <div className="mode-emoji">🏁</div>
          <h2>Single player</h2>
          <p>Five back-to-back typing tests. Beat your own best WPM.</p>
        </button>

        <button className="mode-card accent" onClick={() => navigate('/host')}>
          <div className="mode-emoji">⚔️</div>
          <h2>Multiplayer</h2>
          <p>
            Race five passages, get a share link, and challenge everyone else to
            beat your average WPM on the same texts.
          </p>
        </button>
      </div>
    </div>
  )
}
