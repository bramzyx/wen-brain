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

function LoginModal({ onClose }) {
  const { play, playBg } = useSound()
  const { setVisitor, soundEnabled, toggleSound } = useGameStore()
  const navigate = useNavigate()

  const handleXLogin = async () => {
    play('click')
    if (!soundEnabled) toggleSound()
    try { await startXLogin() } catch (_) {}
  }

  const handleVisitor = () => {
    play('click')
    if (!soundEnabled) toggleSound()
    playBg()
    setVisitor()
    onClose()
    navigate('/game')
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,17,0.96)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card-dark p-8 max-w-md w-full text-center relative"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ delay: 0.05, type: 'spring', damping: 20 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1 }}
          aria-label="Close"
        >
          ✕
        </button>

        <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Hello &amp; Welcome 👋
        </p>
        <div
          className="mb-6"
          style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '2rem', letterSpacing: '0.06em', lineHeight: 1 }}
        >
          <span style={{ color: 'var(--text-primary)' }}>WEN</span><span style={{ color: '#F7931A' }}>BRAIN</span>
        </div>
        <p className="font-mono text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Login with X for full access &amp; leaderboard.<br />
          Or try the first 3 levels free, no account needed.
        </p>

        <button
          type="button"
          onClick={handleXLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-syne font-bold text-base transition-all hover:opacity-90 mb-3"
          style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
        >
          <XIcon size={16} />
          Login with X — Full Access
        </button>

        <button
          type="button"
          onClick={handleVisitor}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-syne font-bold text-sm transition-all hover:opacity-80"
          style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Continue as Visitor
        </button>

        <p className="font-mono text-xs mt-5" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
          *not financial advice
        </p>
      </motion.div>
    </motion.div>,
    document.body
  )
}

function getSavedXUser() {
  try { return JSON.parse(localStorage.getItem('xUser')) } catch { return null }
}

export default function LandingPage() {
  const { totalXP, xUser, isVisitor, soundEnabled, toggleSound } = useGameStore()
  const { play } = useSound()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const levelMapRef = useRef(null)

  const isLoggedIn = !!(xUser || getSavedXUser())

  useEffect(() => {
    if (xUser && showLoginModal) setShowLoginModal(false)
  }, [xUser, showLoginModal])

  useEffect(() => {
    if (sessionStorage.getItem('showLoginModal')) {
      sessionStorage.removeItem('showLoginModal')
      setShowLoginModal(true)
    }
  }, [])

  const handleStartClick = () => {
    play('click')
    if (!soundEnabled) toggleSound()
    if (isLoggedIn) {
      navigate('/game')
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <div className="min-h-screen relative" style={{ paddingTop: '84px' }} onClick={() => { if (!soundEnabled) toggleSound() }}>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4"
        style={{ minHeight: '100vh' }}>

        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <ParticleField />
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(247,147,26,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <MatrixRain />

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
                LEARN OR GET REKT
              </div>
              <div className="font-syne font-bold text-lg" style={{ color: '#00FF94' }}>
                ON-CHAIN 2026
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

          {/* $WenBrain Token Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ marginTop: 32, textAlign: 'center' }}
          >
            {/* Shining label */}
            <div style={{ marginBottom: 8 }}>
              <span
                className="font-mono text-xs font-bold"
                style={{
                  color: '#F7931A',
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  textShadow: '0 0 20px #F7931A99, 0 0 40px #F7931A44',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                $WENBRAIN
              </span>
            </div>

            {/* Short description */}
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-secondary)', letterSpacing: 1 }}>
              the token for degens who actually learned something
            </p>

            {/* CA + Copy button */}
            <div
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl w-full"
              style={{
                background: 'rgba(247,147,26,0.06)',
                border: '1px solid rgba(247,147,26,0.25)',
                maxWidth: 600,
              }}
            >
              <span
                className="font-mono text-xs sm:text-sm flex-1 min-w-0"
                style={{
                  color: '#F7931A',
                  letterSpacing: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                id="ca-address"
              >
                00000000000000000000000000000000000000000000
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('00000000000000000000000000000000000000000000')
                  const btn = document.getElementById('ca-copy-btn')
                  if (btn) { btn.innerText = 'Copied!'; setTimeout(() => { btn.innerText = 'Copy' }, 2000) }
                }}
                id="ca-copy-btn"
                className="font-mono text-xs px-4 py-2 rounded-lg flex-shrink-0 transition-all hover:opacity-80"
                style={{
                  background: '#F7931A',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem',
                }}
              >
                Copy
              </button>
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

      <section ref={levelMapRef} className="relative px-4 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="card-dark p-6" onClick={() => { window.scrollTo(0, 0); navigate('/game') }} style={{ cursor: 'pointer' }}>
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

              {/* Crypto Vocabulary Preview */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,255,148,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontSize: 16 }}>📚</span>
                  <span className="font-syne font-black text-sm" style={{ color: '#00FF94' }}>Crypto Vocabulary</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>— 6 volumes</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 1, emoji: '🧠', short: 'The Basics',      color: '#00FF94' },
                    { id: 2, emoji: '📉', short: 'Trading Talk',    color: '#FF3366' },
                    { id: 3, emoji: '🐸', short: 'Community Slang', color: '#FFD700' },
                    { id: 4, emoji: '⚙️', short: 'Technical Terms', color: '#627EEA' },
                    { id: 5, emoji: '💎', short: 'Meme Culture',    color: '#9945FF' },
                    { id: 6, emoji: '🎯', short: 'Advanced Degen',  color: '#F7931A' },
                  ].map((lvl) => (
                    <div key={lvl.id} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'var(--bg-secondary)', border: `1px solid ${lvl.color}33` }}>
                      <span style={{ fontSize: 14 }}>{lvl.emoji}</span>
                      <div>
                        <div className="font-mono text-[10px] font-bold" style={{ color: lvl.color }}>VOL. {lvl.id}</div>
                        <div className="font-syne font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{lvl.short}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            {(xUser || getSavedXUser()) && (
              <div className="card-dark p-4">
                <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  GM, SER
                </div>
                <div className="font-syne font-bold text-lg" style={{ color: '#F7931A' }}>
                  @{(xUser || getSavedXUser()).username}
                </div>
                <div className="font-mono text-xs mt-1" style={{ color: '#00FF94' }}>
                  {totalXP.toLocaleString()} points total
                </div>
              </div>
            )}
            {isVisitor && !xUser && !getSavedXUser() && (
              <div className="card-dark p-4">
                <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  VISITOR MODE
                </div>
                <div className="font-syne font-bold text-sm" style={{ color: '#888' }}>
                  Levels 1-3 unlocked
                </div>
                <div className="font-mono text-xs mt-1" style={{ color: '#F7931A' }}>
                  Login with X for all 10 levels
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
            {isLoggedIn ? 'Continue Journey 🚀' : "Start Learning - It's Free 🔥"}
          </button>
          <p className="font-mono text-xs mt-3 opacity-40" style={{ color: 'var(--text-secondary)' }}>
            *still not financial advice
          </p>
        </motion.div>
      </section>

      <section className="px-4 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <div className="font-mono text-xs mb-2" style={{ color: '#F7931A' }}>RANKED BY POINTS</div>
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

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}