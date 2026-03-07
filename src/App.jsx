import { lazy, Suspense, useEffect, useRef } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import LandingPage from './components/LandingPage'
import SoundManager from './components/SoundManager'
import Footer from './components/Footer'
import { handleXCallback } from './hooks/useXAuth'
import { useGameStore } from './store/useGameStore'

// ── Detect OAuth code immediately, before React renders ──────────────────────
// Covers two cases:
//   1) Netlify serves index.html for /auth/callback?code=xxx → code is in window.location.search
//   2) Bridge page redirected to /#/?code=xxx             → code is in the hash query string
function getOAuthParams() {
  const qs = new URLSearchParams(window.location.search)
  if (qs.get('code')) {
    return { code: qs.get('code'), state: qs.get('state') || '', fromSearch: true }
  }
  const hash = window.location.hash          // e.g. "#/?code=xxx&state=yyy"
  const qi = hash.indexOf('?')
  if (qi !== -1) {
    const hqs = new URLSearchParams(hash.slice(qi + 1))
    if (hqs.get('code')) {
      return { code: hqs.get('code'), state: hqs.get('state') || '', fromSearch: false }
    }
  }
  return null
}

// Evaluated once at module load — before any render
const OAUTH = getOAuthParams()

// ── Loading screen + token exchange ─────────────────────────────────────────
function OAuthCallbackHandler() {
  const { setXUser, setPlayerName, submitToLeaderboard } = useGameStore()
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    // Clean the URL so a refresh won't re-trigger
    if (OAUTH.fromSearch) {
      window.history.replaceState({}, '', window.location.pathname)
    }

    handleXCallback(OAUTH.code, OAUTH.state).then((user) => {
      if (user) {
        try { localStorage.setItem('xUser', JSON.stringify(user)) } catch {}
        setXUser(user)
        setPlayerName(user.username)
        submitToLeaderboard(user.username)
        navigate('/game', { replace: true })
      } else {
        // Exchange failed — clean up PKCE so future logins work
        sessionStorage.removeItem('x_pkce_verifier')
        sessionStorage.removeItem('x_pkce_state')
        navigate('/', { replace: true })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      background: '#080B11', fontFamily: '"IBM Plex Mono", monospace', gap: '1rem',
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.06em' }}>
        <span style={{ color: '#fff' }}>WEN</span>
        <span style={{ color: '#F7931A' }}>BRAIN</span>
      </div>
      <div style={{ color: '#888', fontSize: '0.85rem' }}>Logging you in...</div>
      <div style={{ width: '140px', height: '2px', background: '#1a1a1a', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #F7931A, #00FF94)',
          animation: 'wbSlide 1.4s ease-in-out infinite',
        }} />
      </div>
      <style>{`@keyframes wbSlide{0%{transform:translateX(-100%);width:60%}50%{width:80%}100%{transform:translateX(240%);width:60%}}`}</style>
    </div>
  )
}

// ── Lazy level pages ─────────────────────────────────────────────────────────
const GamePage    = lazy(() => import('./components/GamePage'))
const Level1Page  = lazy(() => import('./components/Level1Page'))
const Level2Page  = lazy(() => import('./components/Level2Page'))
const Level3Page  = lazy(() => import('./components/Level3Page'))
const Level4Page  = lazy(() => import('./components/Level4Page'))
const Level5Page  = lazy(() => import('./components/Level5Page'))
const Level6Page  = lazy(() => import('./components/Level6Page'))
const Level7Page  = lazy(() => import('./components/Level7Page'))
const Level8Page  = lazy(() => import('./components/Level8Page'))
const Level9Page  = lazy(() => import('./components/Level9Page'))
const Level10Page = lazy(() => import('./components/Level10Page'))

const Fallback = () => (
  <div style={{ paddingTop: '120px', textAlign: 'center', color: '#F7931A', fontFamily: 'monospace' }}>
    Loading...
  </div>
)

export default function App() {
  // If an OAuth code was detected at load time, show the callback handler
  // before rendering anything else. HashRouter wraps it so useNavigate works.
  if (OAUTH) {
    return (
      <HashRouter>
        <OAuthCallbackHandler />
      </HashRouter>
    )
  }

  return (
    <HashRouter>
      <div className="scanline-overlay" />
      <div className="scanline-beam" />
      <SoundManager />
      <Navbar />
      <Ticker />

      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/game"     element={<GamePage />} />
          <Route path="/level/1"  element={<Level1Page />} />
          <Route path="/level/2"  element={<Level2Page />} />
          <Route path="/level/3"  element={<Level3Page />} />
          <Route path="/level/4"  element={<Level4Page />} />
          <Route path="/level/5"  element={<Level5Page />} />
          <Route path="/level/6"  element={<Level6Page />} />
          <Route path="/level/7"  element={<Level7Page />} />
          <Route path="/level/8"  element={<Level8Page />} />
          <Route path="/level/9"  element={<Level9Page />} />
          <Route path="/level/10" element={<Level10Page />} />
          <Route path="/level/:id" element={<GamePage />} />
        </Routes>
      </Suspense>

      <Footer />
    </HashRouter>
  )
}
