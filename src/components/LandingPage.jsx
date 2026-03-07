import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { startXLogin } from '../hooks/useXAuth'
import MatrixRain from './MatrixRain'
import ParticleField from './ParticleField'
import Leaderboard from './Leaderboard'
import LevelMap from './LevelMap'

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
  </svg>
)

const MEME_QUOTES = [
  'Few understand this.',
  'WAGMI ser.',
  'Your bank hates this.',
  'Satoshi is watching.',
  'Not financial advice.',
  'gm fren. LFG.',
  'Have fun staying poor.',
  'Number go up technology.',
]

function RotatingQuote() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % MEME_QUOTES.length), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="font-mono text-sm italic"
        style={{ color: 'var(--text-secondary)' }}
      >
        "{MEME_QUOTES[idx]}"
      </motion.p>
    </AnimatePresence>
  )
}

function TypewriterSubtitle() {
  const text = 'Learn or Get Rekt'
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(id)
    }, 80)
    return () => clearInterval(id)
  }, [])

  return (
    <h2
      className="font-mono text-xl md:text-2xl font-medium cursor-blink"
      style={{ color: '#888888', letterSpacing: '0.08em' }}
    >
      {displayed}
    </h2>
  )
}

// Portal modal — always above everything, z-index 9999
function NameModal({ onStart, initialName = '' }) {
  const [guestMode, setGuestMode] = useState(!!initialName) // returning users go straight to guest/name edit
  const [name, setName] = useState(initialName)
  const { setPlayerName, submitToLeaderboard } = useGameStore()
  const { play } = useSound()
  const inputRef = useRef(null)

  useEffect(() => {
    if (guestMode) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [guestMode])

  const handleStart = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    play('click')
    setPlayerName(trimmed)
    submitToLeaderboard(trimmed)
    onStart()
  }

  const handleXLogin = async () => {
    play('click')
    try { await startXLogin() } catch (_) {}
  }

  const isReturning = !!initialName

  return createPortal(
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,17,0.96)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card-dark p-8 max-w-md w-full text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ delay: 0.05, type: 'spring', damping: 20 }}
      >
        {!guestMode ? (
          /* ── X Login view ── */
          <>
            <div className="text-4xl mb-4">₿</div>
            <h2 className="font-syne font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
              GM, ser. Who are you?
            </h2>
            <p className="font-mono text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              Your name goes on the leaderboard. Choose wisely. IYKYK.
            </p>

            {/* Login with X — primary */}
            <button
              type="button"
              onClick={handleXLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-syne font-bold text-base mb-4 transition-all hover:opacity-90"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
            >
              <XIcon size={16} />
              Login with X
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Guest option */}
            <button
              type="button"
              onClick={() => setGuestMode(true)}
              className="w-full py-3 rounded-lg font-mono text-sm transition-all hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Continue as Guest 👻
            </button>

            <p className="font-mono text-xs mt-4" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              *not financial advice
            </p>
          </>
        ) : (
          /* ── Guest / returning user name input ── */
          <>
            <div className="text-4xl mb-4">{isReturning ? '👋' : '👻'}</div>
            <h2 className="font-syne font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
              {isReturning ? 'Welcome back, ser' : 'Pick Your Alias'}
            </h2>
            <p className="font-mono text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {isReturning
                ? <>Your name is on the leaderboard.<br />Edit it and LFG.</>
                : 'Your name goes on the leaderboard. No pressure.'}
            </p>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="SatoshiGhost, DegenerateKing..."
              maxLength={24}
              className="w-full px-4 py-3 rounded-lg font-mono text-sm mb-4"
              style={{
                background: '#1a2030',
                border: '1px solid #334155',
                color: '#f0f6fc',
                outline: 'none',
                boxShadow: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleStart}
              className="btn-primary w-full text-lg mb-3"
              style={{
                fontFamily: 'Syne, sans-serif',
                opacity: name.trim() ? 1 : 0.45,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              LFG 🚀
            </button>
            {!isReturning && (
              <button
                type="button"
                onClick={() => setGuestMode(false)}
                className="font-mono text-xs transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                ← back to Login with X
              </button>
            )}
            <p className="font-mono text-xs mt-3" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              *not financial advice
            </p>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default function LandingPage() {
  const { playerName, totalXP, fakeStats } = useGameStore()
  const { play } = useSound()
  const navigate = useNavigate()
  const [showNameModal, setShowNameModal] = useState(false)
  const levelMapRef = useRef(null)

  const handleStartClick = () => {
    play('click')
    setShowNameModal(true)
  }

  // After LFG is confirmed: close modal → navigate to game screen
  const handleNameSubmit = () => {
    setShowNameModal(false)
    navigate('/game')
  }

  return (
    <div className="min-h-screen relative" style={{ paddingTop: '84px' }}>
      {/* Hero section — NO overflow-hidden so title is never clipped.
          Particle/bg layers use a separate absolute inset container that clips itself. */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4"
        style={{ minHeight: '100vh' }}>

        {/* Background effects live in their own overflow-hidden shell */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <ParticleField />
          {/* Radial glow */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(247,147,26,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* MatrixRain renders position:fixed so it's unaffected by any container */}
        <MatrixRain />

        {/* Content — always on top, safe padding ensures title never kisses the navbar */}
        <div className="relative text-center max-w-4xl mx-auto w-full"
          style={{ zIndex: 2, paddingTop: '5vh', paddingBottom: '4vh' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              className="leading-none select-none mb-2"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 700,
                fontSize: 'clamp(3.5rem, 12vw, 9rem)',
                letterSpacing: '0.06em',
                textAlign: 'center',
              }}
            >
              <span className="glitch-text" style={{ display: 'block', color: 'var(--text-primary)' }}>
                WEN
              </span>
              <span className="glitch-text" style={{ display: 'block', color: '#F7931A', animationDelay: '1.5s' }}>
                BRAIN
              </span>
            </h1>
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TypewriterSubtitle />
          </motion.div>

          <motion.div
            className="mb-8 h-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <RotatingQuote />
          </motion.div>

          {/* CTA — inline style, no Framer wrapper that could interfere with clicks */}
          <div style={{ opacity: 0, animation: 'fadeUp 0.5s ease 1.1s forwards' }}>
            <button
              type="button"
              onClick={handleStartClick}
              className="btn-primary text-xl px-10 py-4"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.2rem' }}
            >
              Start Your Journey 🔥
            </button>
          </div>

          <motion.div
            className="flex items-center justify-center gap-6 mt-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <div className="text-center">
              <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                PLAYERS LEARNING
              </div>
              <div className="font-syne font-bold text-lg" style={{ color: '#00FF94' }}>
                {(fakeStats.players + (totalXP > 0 ? 1 : 0)).toLocaleString()}
              </div>
            </div>
            <div style={{ color: 'var(--border)' }}>|</div>
            <div className="text-center">
              <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                XP EARNED TODAY
              </div>
              <div className="font-syne font-bold text-lg" style={{ color: '#F7931A' }}>
                {(fakeStats.xpToday + totalXP).toLocaleString()}
              </div>
            </div>
            <div style={{ color: 'var(--border)' }}>|</div>
            <div className="text-center">
              <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                *NOT FINANCIAL ADVICE
              </div>
              <div className="font-syne font-bold text-lg" style={{ color: '#FF3366' }}>
                NGMI
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ color: 'var(--text-secondary)', zIndex: 2, position: 'relative' }}
        >
          <div className="font-mono text-xs">scroll down ser</div>
          <div className="mt-1">↓</div>
        </motion.div>
      </section>

      {/* Level map + Leaderboard */}
      <section ref={levelMapRef} className="relative px-4 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                    Your Crypto Journey
                  </h2>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    10 levels. Bitcoin to memecoins. LFG.
                  </p>
                </div>
              </div>
              <LevelMap preview />
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            {playerName && (
              <div className="card-dark p-4">
                <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  GM, SER
                </div>
                <div className="font-syne font-bold text-lg" style={{ color: '#F7931A' }}>
                  {playerName}
                </div>
                <div className="font-mono text-xs mt-1" style={{ color: '#00FF94' }}>
                  {totalXP.toLocaleString()} XP total
                </div>
              </div>
            )}

            <Leaderboard limit={3} />

            <div className="card-dark p-4">
              <div className="font-mono text-xs mb-2" style={{ color: '#9945FF' }}>
                CRYPTO WISDOM ✨
              </div>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                "The best time to learn about crypto was 10 years ago. The second best time is right now. ser."
              </p>
              <p className="font-mono text-xs mt-2 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                — probably Satoshi
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Ready to stop being ngmi? 👀
          </p>
          <button
            type="button"
            onClick={handleStartClick}
            className="btn-primary text-lg px-12 py-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {playerName ? 'Continue Journey 🚀' : "Start Learning — It's Free 🔥"}
          </button>
          <p className="font-mono text-xs mt-3 opacity-40" style={{ color: 'var(--text-secondary)' }}>
            *still not financial advice
          </p>
        </motion.div>
      </section>

      {/* Full leaderboard section */}
      <section className="px-4 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <div className="font-mono text-xs mb-2" style={{ color: '#F7931A' }}>RANKED BY XP</div>
            <h2 className="font-syne font-black text-3xl" style={{ color: 'var(--text-primary)' }}>
              HALL OF BASED
            </h2>
            <p className="font-mono text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Top degens who actually learned something. WAGMI.
            </p>
          </div>
          <Leaderboard full />
        </motion.div>
      </section>

      {/* Name modal — portal, always on top */}
      <AnimatePresence>
        {showNameModal && (
          <NameModal
            onStart={handleNameSubmit}
            initialName={playerName}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
