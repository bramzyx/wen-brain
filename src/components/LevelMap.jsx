import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const LEVELS = [
  { id: 1, title: 'In the Beginning: Bitcoin', emoji: '🟠', color: '#F7931A', short: 'Bitcoin Basics' },
  { id: 2, title: 'Who is Satoshi?', emoji: '👻', color: '#FFD700', short: 'The Greatest Mystery' },
  { id: 3, title: 'The Kid Who Built Ethereum', emoji: '💙', color: '#627EEA', short: 'Smart Contracts' },
  { id: 4, title: 'Solana: The Fast and the Furious', emoji: '⚡', color: '#9945FF', short: '65,000 TPS' },
  { id: 5, title: 'Hall of Shame', emoji: '🤡', color: '#FF3366', short: 'Biggest Scams' },
  { id: 6, title: 'Memecoins: From Joke to Millionaire', emoji: '🐸', color: '#FFD700', short: 'DOGE to PEPE' },
  { id: 7, title: 'Whales, Manipulation & Markets', emoji: '🐋', color: '#0099FF', short: 'How It Really Works' },
  { id: 8, title: 'Tools of the Trade', emoji: '🛠️', color: '#00FF94', short: 'Not Lose Everything' },
  { id: 9, title: "What's Happening NOW", emoji: '🚀', color: '#E0E0E0', short: 'The Current Meta' },
  { id: 10, title: 'FINAL BOSS: WAGMI?', emoji: '🏆', color: '#FFD700', short: 'Are You Ready?' },
]

export default function LevelMap({ preview = false }) {
  const { levels } = useGameStore()
  const displayLevels = preview ? LEVELS.slice(0, 6) : LEVELS

  return (
    <div className="w-full">
      {preview && (
        <div className="flex items-center justify-between mb-4">
          <span className="font-syne font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
            LEVEL MAP
          </span>
          <span className="font-mono text-xs" style={{ color: '#F7931A' }}>10 levels</span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayLevels.map((lvl, i) => {
          const storeLevel = levels.find((l) => l.id === lvl.id)
          const unlocked = storeLevel?.unlocked ?? i === 0
          const completed = storeLevel?.completed ?? false

          return (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative p-3 rounded-lg border cursor-pointer transition-all duration-200 group"
              style={{
                background: completed
                  ? `rgba(${hexToRgb(lvl.color)},0.15)`
                  : unlocked
                  ? 'var(--bg-card)'
                  : 'rgba(0,0,0,0.3)',
                borderColor: completed
                  ? lvl.color
                  : unlocked
                  ? 'var(--border)'
                  : 'transparent',
                opacity: unlocked ? 1 : 0.4,
              }}
            >
              {completed && (
                <div
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ background: lvl.color, color: '#000' }}
                >
                  ✓
                </div>
              )}
              {!unlocked && (
                <div className="absolute top-1.5 right-1.5 text-xs opacity-60">🔒</div>
              )}
              <div className="text-lg mb-1">{lvl.emoji}</div>
              <div className="font-mono text-xs font-bold mb-0.5" style={{ color: lvl.color }}>
                LVL {lvl.id}
              </div>
              <div className="font-syne text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {lvl.short}
              </div>
            </motion.div>
          )
        })}
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-3 rounded-lg border flex items-center justify-center"
            style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
          >
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              +4 more...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
