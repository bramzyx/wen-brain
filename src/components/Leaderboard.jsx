import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const DEMO_BOARD = [
  { name: 'SatoshiGhost', xp: 42500 },
  { name: 'DegenerateKing', xp: 38200 },
  { name: 'NotFinancialAdvice', xp: 31100 },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['👑', '🥈', '🥉']

export default function Leaderboard({ limit = 3 }) {
  const { leaderboard, playerName, totalXP } = useGameStore()
  const board = leaderboard.length > 0 ? leaderboard.slice(0, limit) : DEMO_BOARD.slice(0, limit)

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
            <span
              className="font-mono text-xs flex-1 truncate"
              style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-secondary)' }}
            >
              {entry.name}
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
