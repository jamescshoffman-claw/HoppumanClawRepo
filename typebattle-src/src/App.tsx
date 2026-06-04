import { useEffect, useState } from 'react'
import Home from './Home'
import SinglePlayer from './SinglePlayer'
import { MultiplayerHost, Race, Lobby } from './Multiplayer'

// Tiny hash-based router. Hash routing means the static site needs zero server
// rewrite rules — every URL loads index.html and we read the route from the
// hash. That keeps shareable links (#/race/<id>) working locally and on any host.
export function navigate(path: string) {
  window.location.hash = path
}

function useHashPath(): string {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [path, setPath] = useState(read)
  useEffect(() => {
    const onChange = () => setPath(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export default function App() {
  const path = useHashPath()

  let screen
  const raceMatch = path.match(/^\/race\/([^/]+)$/)
  const lobbyMatch = path.match(/^\/lobby\/([^/]+)$/)

  if (path === '/single') screen = <SinglePlayer />
  else if (path === '/host') screen = <MultiplayerHost />
  else if (raceMatch) screen = <Race lobbyId={raceMatch[1]} />
  else if (lobbyMatch) screen = <Lobby lobbyId={lobbyMatch[1]} />
  else screen = <Home />

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">⌨️ Type Race</a>
        <span className="brand-site">WhatIsJamesDoing.com</span>
      </header>
      <main className="content">{screen}</main>
    </div>
  )
}
