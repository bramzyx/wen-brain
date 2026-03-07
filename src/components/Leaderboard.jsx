import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['👑', '🥈', '🥉']

// Fallback demo data shown when the API has no real entries yet
const DEMO_BOARD = [
  { id: 'demo1', username: 'SatoshiGhost',      profilePicture: null, xp: 42500, levelsCompleted: 10 },
  { id: 'demo2', username: 'DegenerateKing',     profilePicture: null, xp: 38200, levelsCompleted: 9  },
  { id: 'demo3', username: 'NotFinancialAdvice', profilePicture: null, xp: 31100, levelsCompleted: 7  },
]

function Avatar({ entry, size = 28 }) {
  const src = entry.profilePicture || entry.avatarUrl
  if (src) {
    return (
      <img
        src={src}
        alt={entry.username || entry.name || '?'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  const initial = ((entry.username || entry.name || '?')[0]).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1DA1F2', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.45), fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

function useLeaderboardData(autoRefreshMs = 60_000) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/leaderboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, autoRefreshMs)
    return () => clearInterval(id)
  }, [fetchData, autoRefreshMs])

  return { data, loading, error }
}

export default function Leaderboard({ limit = 3, full = false }) {
  const { xUser } = useGameStore()
  const { data, loading, error } = useLeaderboardData()

  const displayLimit = full ? 50 : limit
  const board   = data.length > 0 ? data.slice(0, displayLimit) : DEMO_BOARD.slice(0, displayLimit)
  const isDemo  = data.length === 0

  // ── Full leaderboard (Hall of Based section) ──────────────────────────────
  if (full) {
    return (
      <div className="card-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
            {loading ? 'Fetching degens...' : error ? 'Could not load' : `${data.length} player${data.length !== 1 ? 's' : ''}`}
          </span>
          {!loading && !error && data.length > 0 && (
            <span className="font-mono text-xs" style={{ color: '#00FF94' }}>● LIVE</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {board.length === 0 ? (
            <p className="font-mono text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No players yet. Be the first degen. LFG.
            </p>
          ) : (
            <div className="space-y-3">
              {board.map((entry, i) => {
                const isMe = xUser && (entry.id === xUser.xId || entry.username === xUser.username)
                return (
                  <motion.div
                    key={entry.id || entry.username}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-3 rounded-lg"
                    style={{
                      background: isMe
                        ? 'rgba(247,147,26,0.1)'
                        : i === 0 ? 'rgba(255,215,0,0.05)' : 'var(--bg-secondary)',
                      border: isMe
                        ? '1px solid rgba(247,147,26,0.4)'
                        : i === 0 ? '1px solid rgba(255,215,0,0.2)' : '1px solid var(--border)',
                    }}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {i < 3
                        ? <span style={{ fontSize: 20 }}>{RANK_LABELS[i]}</span>
                        : <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>#{i + 1}</span>
                      }
                    </div>

                    {/* Avatar */}
                    <Avatar entry={entry} size={38} />

                    {/* Username + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono text-sm font-bold truncate"
                          style={{ color: isMe ? '#F7931A' : i < 3 ? RANK_COLORS[i] : 'var(--text-primary)' }}
                        >
                          @{entry.username || entry.name}
                          {isMe && <span style={{ color: '#888', fontWeight: 400 }}> (you)</span>}
                        </span>
                        {isDemo && (
                          <span className="font-mono text-xs px-1 rounded" style={{ color: '#444', background: '#111' }}>
                            demo
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {entry.levelsCompleted ?? 0}/10 levels completed
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-syne font-bold text-lg" style={{ color: '#F7931A' }}>
                        {entry.xp.toLocaleString()}
                      </div>
                      <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>XP</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Compact sidebar version ───────────────────────────────────────────────
  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: '#FFD700' }}>🏆</span>
          <span className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            TOP DEGENS
          </span>
        </div>
        {!loading && !error && data.length > 0 && (
          <span className="font-mono text-xs" style={{ color: '#00FF94' }}>● LIVE</span>
        )}
      </div>

      <div className="space-y-2">
        {board.map((entry, i) => {
          const isMe = xUser && (entry.id === xUser.xId || entry.username === xUser.username)
          return (
            <motion.div
              key={entry.id || entry.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-2 rounded"
              style={{
                background: isMe ? 'rgba(247,147,26,0.1)' : 'transparent',
                border: isMe ? '1px solid rgba(247,147,26,0.3)' : '1px solid transparent',
              }}
            >
              <span className="text-sm">{RANK_LABELS[i] || `#${i + 1}`}</span>
              <Avatar entry={entry} size={22} />
              <span
                className="font-mono text-xs flex-1 truncate"
                style={{ color: isMe ? '#F7931A' : i < 3 ? RANK_COLORS[i] : 'var(--text-secondary)' }}
              >
                @{entry.username || entry.name}
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: '#F7931A' }}>
                {entry.xp.toLocaleString()} XP
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
