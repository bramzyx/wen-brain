import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { startXLogin } from '../hooks/useXAuth'

const VISITOR_LIMIT = 3

const LEVELS = [
  { id: 1,  title: 'In the Beginning: Bitcoin',         emoji: '🟠', color: '#F7931A', short: 'Bitcoin Basics',       desc: 'Money, trust, and the pizza guy' },
  { id: 2,  title: 'Who is Satoshi?',                   emoji: '👻', color: '#FFD700', short: 'The Greatest Mystery',  desc: 'Person, group, or alien?' },
  { id: 3,  title: 'The Kid Who Built Ethereum',        emoji: '💙', color: '#627EEA', short: 'Smart Contracts',       desc: 'What if Bitcoin could run code?' },
  { id: 4,  title: 'Solana: Fast and Furious',          emoji: '⚡', color: '#9945FF', short: '65,000 TPS',           desc: 'The speed demon of blockchains' },
  { id: 5,  title: 'Hall of Shame',                     emoji: '🤡', color: '#FF3366', short: 'Biggest Scams',         desc: 'FTX, Luna, Bitconnect HEEEY' },
  { id: 6,  title: 'Memecoins: Joke to Millionaire',   emoji: '🐸', color: '#00CC44', short: 'DOGE to PEPE',          desc: 'From Shiba to $90B market caps' },
  { id: 7,  title: 'Whales, Markets & Manipulation',   emoji: '🐋', color: '#0099FF', short: 'How It Really Works',   desc: "Wash trading, pump dumps, CT" },
  { id: 8,  title: 'Tools of the Trade',                emoji: '🛠️', color: '#00FF94', short: 'Not Lose Everything',   desc: 'Wallets, DEX vs CEX' },
  { id: 9,  title: "What's Happening NOW",              emoji: '🚀', color: '#E0E0E0', short: 'The Current Meta',      desc: 'ETF, halving, AI narrative' },
  { id: 10, title: 'FINAL BOSS: WAGMI?',                emoji: '🏆', color: '#FFD700', short: 'Are You Ready?',        desc: 'All 10 topics. Full send.' },
  { id: 11, comingSoon: true,                           emoji: '🌾', color: '#6B7280', short: 'DeFi Deep Dive',         desc: 'Yield farming, liquidity pools, rug pulls' },
  { id: 12, comingSoon: true,                           emoji: '🤖', color: '#6B7280', short: 'The Future of Crypto',   desc: 'AI + crypto, CBDCs, what\'s next' },
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function VisitorUpgradeModal({ onClose }) {
  const { play } = useSound()
  const handleXLogin = async () => {
    play('click')
    try { await startXLogin() } catch (_) {}
  }
  return createPortal(
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,17,0.92)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-dark p-8 max-w-sm w-full text-center relative"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button" onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}
        >✕</button>

        <div className="text-3xl mb-4">🔒</div>
        <div className="font-mono text-xs mb-2" style={{ color: '#F7931A' }}>VISITOR LIMIT REACHED</div>
        <h2 className="font-syne font-black text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
          Login with X to unlock<br />all 10 levels
        </h2>
        <p className="font-mono text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
          Levels 4-10 are locked in visitor mode.<br />
          Login for full access + leaderboard. WAGMI.
        </p>
        <button
          type="button" onClick={handleXLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-syne font-bold text-base transition-all hover:opacity-90"
          style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
          </svg>
          Login with X — It's Free
        </button>
        <p className="font-mono text-xs mt-4" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
          *still not financial advice
        </p>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default function GamePage() {
  const navigate = useNavigate()
  const { playerName, totalXP, levels, xUser, isVisitor, resetProgress, submitToLeaderboard } = useGameStore()
  const { play } = useSound()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const completedCount = levels.filter((l) => l.completed).length
  const progressPct = Math.round((completedCount / 10) * 100)

  const handleLevelClick = (lvl, storeLevel) => {
    if (!storeLevel?.unlocked) return
    // Visitors can only play levels 1-3
    if (isVisitor && !xUser && lvl.id > VISITOR_LIMIT) {
      play('click')
      setShowUpgrade(true)
      return
    }
    play('click')
    navigate(`/level/${lvl.id}`)
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: '84px', background: 'var(--bg-primary)' }}>
      <AnimatePresence>
        {showUpgrade && <VisitorUpgradeModal onClose={() => setShowUpgrade(false)} />}
      </AnimatePresence>

      {/* Visitor banner */}
      {isVisitor && !xUser && (
        <div
          className="sticky top-14 z-40 flex items-center justify-between px-4 py-2 gap-3 flex-wrap"
          style={{ background: 'rgba(247,147,26,0.12)', borderBottom: '1px solid rgba(247,147,26,0.25)' }}
        >
          <span className="font-mono text-xs" style={{ color: '#F7931A' }}>
            VISITOR MODE — Levels 1-3 free. Login with X to unlock all 10 levels.
          </span>
          <button
            type="button"
            onClick={async () => { try { await startXLogin() } catch (_) {} }}
            className="font-mono text-xs px-3 py-1 rounded font-bold transition-all hover:opacity-80 shrink-0"
            style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
          >
            Login with X
          </button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => { play('click'); navigate('/') }}
              className="font-mono text-xs mb-3 flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              ← back to home
            </button>
            <h1 className="font-syne font-black text-3xl md:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Your <span style={{ color: '#F7931A' }}>Journey</span>
            </h1>
            {playerName && (
              <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                gm, <span style={{ color: '#00FF94' }}>{playerName}</span> — {totalXP.toLocaleString()} Points
              </p>
            )}
          </div>

          {/* Overall progress bar */}
          <div className="sm:text-right">
            <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              OVERALL PROGRESS
            </div>
            <div className="font-syne font-black text-2xl" style={{ color: '#F7931A' }}>
              {completedCount}<span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>/10 levels</span>
            </div>
            <div className="w-48 h-2 rounded-full mt-2" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F7931A, #00FF94)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {LEVELS.map((lvl, i) => {
            if (lvl.comingSoon) {
              return (
                <motion.div
                  key={lvl.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="relative rounded-xl border"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderColor: '#374151',
                    borderStyle: 'dashed',
                    opacity: 0.5,
                    cursor: 'default',
                  }}
                >
                  <div className="h-1 rounded-t-xl" style={{ background: '#374151' }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: '#1f2937', color: '#6B7280', border: '1px solid #374151' }}
                      >
                        🔒 COMING SOON
                      </span>
                      <span className="text-xl">{lvl.emoji}</span>
                    </div>
                    <div className="font-mono text-xs mb-1" style={{ color: '#6B7280' }}>
                      LEVEL {lvl.id}
                    </div>
                    <h3 className="font-syne font-bold text-base leading-tight mb-1" style={{ color: '#6B7280' }}>
                      {lvl.short}
                    </h3>
                    <p className="font-mono text-xs leading-relaxed" style={{ color: '#4B5563' }}>
                      {lvl.desc}
                    </p>
                  </div>
                </motion.div>
              )
            }

            const storeLevel    = levels.find((l) => l.id === lvl.id)
            const unlocked      = storeLevel?.unlocked ?? i === 0
            const completed     = storeLevel?.completed ?? false
            const score         = storeLevel?.score ?? 0
            const visitorLocked = isVisitor && !xUser && lvl.id > VISITOR_LIMIT

            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                onClick={() => handleLevelClick(lvl, storeLevel)}
                className="relative rounded-xl border transition-all duration-200 group"
                style={{
                  background: completed
                    ? `rgba(${hexToRgb(lvl.color)},0.12)`
                    : unlocked && !visitorLocked
                    ? 'var(--bg-card)'
                    : 'rgba(0,0,0,0.4)',
                  borderColor: completed
                    ? lvl.color
                    : unlocked && !visitorLocked
                    ? 'var(--border)'
                    : visitorLocked ? 'rgba(247,147,26,0.2)' : 'transparent',
                  cursor: unlocked && !visitorLocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked && !visitorLocked ? 1 : 0.5,
                  boxShadow: unlocked && !completed
                    ? `0 0 0 0 ${lvl.color}44`
                    : undefined,
                }}
                whileHover={
                  unlocked && !visitorLocked
                    ? { scale: 1.03, boxShadow: `0 0 28px ${lvl.color}55` }
                    : { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } }
                }
                whileTap={unlocked && !visitorLocked ? { scale: 0.97 } : {}}
              >
                {/* Top accent bar */}
                <div
                  className="h-1 rounded-t-xl"
                  style={{ background: unlocked ? lvl.color : 'var(--border)' }}
                />

                <div className="p-5">
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{
                        background: completed ? `${lvl.color}22` : 'var(--bg-secondary)',
                        color: completed ? lvl.color : 'var(--text-secondary)',
                        border: `1px solid ${completed ? lvl.color : 'var(--border)'}`,
                      }}
                    >
                      {completed ? `✓ ${score}/3` : visitorLocked ? '🔒 LOGIN TO UNLOCK' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'}
                    </span>
                    <span className="text-xl">{lvl.emoji}</span>
                  </div>

                  {/* Level number */}
                  <div className="font-mono text-xs mb-1" style={{ color: lvl.color }}>
                    LEVEL {lvl.id}
                  </div>

                  {/* Title */}
                  <h3 className="font-syne font-bold text-base leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                    {lvl.short}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {lvl.desc}
                  </p>

                  {/* Star rating if completed */}
                  {completed && (
                    <div className="flex gap-1 mt-3">
                      {[1, 2, 3].map((s) => (
                        <span key={s} style={{ color: s <= score ? '#FFD700' : 'var(--border)', fontSize: '14px' }}>
                          ★
                        </span>
                      ))}
                      {score === 3 && (
                        <span className="font-mono text-xs ml-1" style={{ color: '#FFD700' }}>WAGMI</span>
                      )}
                    </div>
                  )}

                  {/* Play / lock button on hover */}
                  {unlocked && !completed && !visitorLocked && (
                    <div
                      className="mt-3 font-syne font-bold text-xs text-center py-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: lvl.color, color: '#000' }}
                    >
                      Start Level 🚀
                    </div>
                  )}
                  {visitorLocked && (
                    <div
                      className="mt-3 font-syne font-bold text-xs text-center py-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(247,147,26,0.12)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.3)' }}
                    >
                      Login with X to unlock
                    </div>
                  )}
                  {!unlocked && !visitorLocked && (
                    <div
                      className="mt-3 font-syne font-bold text-xs text-center py-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(255,51,102,0.12)', color: '#FF3366', border: '1px solid rgba(255,51,102,0.3)' }}
                    >
                      🔒 Locked
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom encouragement */}
        <motion.div
          className="text-center mt-12 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {completedCount === 0 && (
            <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
              Start with Level 1. The Bitcoin rabbit hole awaits, ser. 🐇
            </p>
          )}
          {completedCount > 0 && completedCount < 10 && (
            <p className="font-mono text-sm" style={{ color: '#00FF94' }}>
              {completedCount}/10 complete. You're{' '}
              <span style={{ color: '#F7931A' }}>{100 - progressPct}%</span> away from CERTIFIED CRYPTO DEGEN 🔥
            </p>
          )}
          {completedCount === 10 && (
            <div className="flex flex-col items-center gap-4">
              <p className="font-syne font-black text-xl" style={{ color: '#FFD700' }}>
                🏆 CERTIFIED CRYPTO DEGEN — WAGMI SER 🏆
              </p>
              <button
                type="button"
                onClick={() => {
                  play('click')
                  submitToLeaderboard(playerName)
                  resetProgress()
                }}
                className="font-mono text-xs px-6 py-2 rounded border transition-all hover:opacity-80"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', background: 'transparent' }}
              >
                Replay from beginning ↺
              </button>
              <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                Your leaderboard score is saved. Points reset to 0.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
