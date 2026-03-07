import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import LandingPage from './components/LandingPage'
import SoundManager from './components/SoundManager'
import Footer from './components/Footer'
import { handleXCallback } from './hooks/useXAuth'
import { useGameStore } from './store/useGameStore'

// Handles the /auth/callback hash route after X OAuth redirect
function AuthCallback() {
  const navigate = useNavigate()
  const { setXUser, setPlayerName, submitToLeaderboard } = useGameStore()

  useEffect(() => {
    const hash = window.location.hash // '#/auth/callback?code=...&state=...'
    const queryPart = hash.split('?')[1] || ''
    const params = new URLSearchParams(queryPart)
    const code = params.get('code')
    const state = params.get('state')

    if (!code) { navigate('/'); return }

    handleXCallback(code, state).then((user) => {
      if (user) {
        setXUser(user)
        setPlayerName(user.username)
        submitToLeaderboard(user.username)
      }
      navigate('/game')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ paddingTop: '120px', textAlign: 'center', color: '#F7931A', fontFamily: 'monospace' }}>
      Connecting with X...
    </div>
  )
}

const GamePage   = lazy(() => import('./components/GamePage'))
const Level1Page = lazy(() => import('./components/Level1Page'))
const Level2Page = lazy(() => import('./components/Level2Page'))
const Level3Page = lazy(() => import('./components/Level3Page'))
const Level4Page = lazy(() => import('./components/Level4Page'))
const Level5Page = lazy(() => import('./components/Level5Page'))
const Level6Page = lazy(() => import('./components/Level6Page'))
const Level7Page = lazy(() => import('./components/Level7Page'))
const Level8Page = lazy(() => import('./components/Level8Page'))
const Level9Page  = lazy(() => import('./components/Level9Page'))
const Level10Page = lazy(() => import('./components/Level10Page'))

const Fallback = () => (
  <div style={{ paddingTop: '120px', textAlign: 'center', color: '#F7931A', fontFamily: 'monospace' }}>
    Loading...
  </div>
)

export default function App() {
  return (
    <HashRouter>
      {/* Global visual effects */}
      <div className="scanline-overlay" />
      <div className="scanline-beam" />
      <SoundManager />

      <Navbar />
      <Ticker />

      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/game"    element={<GamePage />} />
          <Route path="/level/1" element={<Level1Page />} />
          <Route path="/level/2" element={<Level2Page />} />
          <Route path="/level/3" element={<Level3Page />} />
          <Route path="/level/4" element={<Level4Page />} />
          <Route path="/level/5" element={<Level5Page />} />
          <Route path="/level/6" element={<Level6Page />} />
          <Route path="/level/7" element={<Level7Page />} />
          <Route path="/level/8" element={<Level8Page />} />
          <Route path="/level/9"  element={<Level9Page />} />
          <Route path="/level/10" element={<Level10Page />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Other levels redirect to game map until built */}
          <Route path="/level/:id" element={<GamePage />} />
        </Routes>
      </Suspense>

      <Footer />
    </HashRouter>
  )
}
