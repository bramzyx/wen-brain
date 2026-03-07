import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const DEMO_BOARD = [
  { name: 'SatoshiGhost', xp: 42500, levelsCompleted: 10, wagmiBadges: 8, isXUser: false },
  { name: 'DegenerateKing', xp: 38200, levelsCompleted: 9, wagmiBadges: 6, isXUser: false },
  { name: 'NotFinancialAdvice', xp: 31100, levelsCompleted: 7, wagmiBadges: 4, isXUser: false },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['👑', '🥈', '🥉']

function Avatar({ entry, size = 28 }) {
  if (entry.avatarUrl) {
    return (
      <img
        src={entry.avatarUrl}
        alt={entry.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  const initial = entry.name?.[0]?.toUpperCase() ?? '?'
  const bg = entry.isXUser ? '#1DA1F2' : '#F7931A'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.45), fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

export default function Leaderboard({ limit = 3, full = false }) {
  const { leaderboard, playerName } = useGameStore()
  const displayLimit = full ? 10 : limit
  const board = leaderboard.length > 0 ? leaderboard.slice(0, displayLimit) : DEMO_BOARD.slice(0, displayLimit)

  if (full) {
    return (
      <div className="card-dark p-6">
        {board.length === 0 ? (
          <p className="font-mono text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No players yet. Be the first degen. LFG.
          </p>
        ) : (
          <div className="space-y-3">
            {board.map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-3 rounded-lg"
                style={{
                  background: entry.name === playerName
                    ? 'rgba(247,147,26,0.1)'
                    : i === 0 ? 'rgba(255,215,0,0.05)' : 'var(--bg-secondary)',
                  border: entry.name === playerName
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

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-mono text-sm font-bold truncate"
                      style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-primary)' }}
                    >
                      {entry.isXUser ? `@${entry.name}` : entry.name}
                    </span>
                    {entry.wagmiBadges > 0 && (
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,215,0,0.15)',
                          color: '#FFD700',
                          border: '1px solid rgba(255,215,0,0.3)',
                          flexShrink: 0,
                        }}
                      >
                        WAGMI ×{entry.wagmiBadges}
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
            ))}
          </div>
        )}
      </div>
    )
  }

  // Compact sidebar version
  return (
    <div className="card-dark p-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#FFD700' }}>🏆</span>
        <span className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          TOP DEGENS
        </span>
      </div>
      <div className="space-y-2">
        {board.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 p-2 rounded"
            style={{
              background: entry.name === playerName ? 'rgba(247,147,26,0.1)' : 'transparent',
              border: entry.name === playerName ? '1px solid rgba(247,147,26,0.3)' : '1px solid transparent',
            }}
          >
            <span className="text-sm">{RANK_LABELS[i] || `#${i + 1}`}</span>
            <Avatar entry={entry} size={22} />
            <span
              className="font-mono text-xs flex-1 truncate"
              style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-secondary)' }}
            >
              {entry.isXUser ? `@${entry.name}` : entry.name}
            </span>
            <span className="font-mono text-xs font-bold" style={{ color: '#F7931A' }}>
              {entry.xp.toLocaleString()} XP
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
