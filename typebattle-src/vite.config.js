import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This app is one of several sub-apps on whatisjamesdoing.com (alongside
// /game, /koreanstudy, etc.). It is served as a standalone static bundle from
// the repo's /typebattle/ folder on GitHub Pages, so:
//   - `base` is '/typebattle/' so built asset URLs resolve under that subpath.
//   - the build writes straight into ../../typebattle (the committed, served
//     folder at the repo root), the same way koreanstudy/ and game/ ship.
// Hash-based routing (see App.tsx) means every URL under /typebattle/ just
// loads index.html and the app reads the route from location.hash — no server
// rewrite rules needed.
export default defineConfig({
  plugins: [react()],
  base: '/typebattle/',
  root: 'src',
  publicDir: 'public',
  build: {
    outDir: '../../typebattle',
    emptyOutDir: true,
  },
})
