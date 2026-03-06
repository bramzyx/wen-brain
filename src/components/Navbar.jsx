import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'

export default function Navbar() {
  const { totalXP, soundEnabled, toggleSound } = useGameStore()
  const { play } = useSound()

  const xpToNext = 1000
  const xpProgress = Math.min((totalXP % xpToNext) / xpToNext, 1) * 100

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(8,11,17,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + Follow on X */}
        <div className="flex items-center gap-4">
          <Link to="/" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.1rem', textDecoration: 'none' }}>
            <span style={{ color: 'var(--text-primary)' }}>WEN</span><span style={{ color: '#F7931A' }}>BRAIN</span>
          </Link>
          <a
            href="https://x.com/wenbrainbro"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-all hover:opacity-80"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
            </svg>
            <span className="glitch-text" style={{ animationDuration: '4s' }}>Follow</span>
          </a>
        </div>

        {/* XP bar */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: '#F7931A' }}>XP</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F7931A, #00FF94)' }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              {totalXP.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Sound toggle only — dark mode is permanent */}
        <button
          type="button"
          onClick={() => { play('click'); toggleSound() }}
          className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
          style={{ background: 'var(--bg-card)', color: soundEnabled ? '#F7931A' : 'var(--text-secondary)' }}
          title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </nav>
  )
}
