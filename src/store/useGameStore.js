import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LEVEL_COUNT = 10

const defaultLevels = Array.from({ length: LEVEL_COUNT }, (_, i) => ({
  id: i + 1,
  unlocked: i === 0,
  completed: false,
  score: 0,
  xpEarned: 0,
  badge: null,
}))

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Player
      playerName: '',
      totalXP: 0,
      levels: defaultLevels,

      // UI
      soundEnabled: true,
      musicEnabled: false,

      // Leaderboard
      leaderboard: [],

      // Fake stats for landing page
      fakeStats: {
        players: 1247,
        xpToday: 847300,
      },

      // Actions
      setPlayerName: (name) => set({ playerName: name }),

      addXP: (amount) => set((s) => ({ totalXP: s.totalXP + amount })),

      completeLevel: (levelId, score, xpEarned) => {
        const perfect = score === 3
        const badge = perfect ? 'WAGMI' : null
        const bonusXP = perfect ? 150 : 0

        set((s) => {
          const levels = s.levels.map((l) => {
            if (l.id === levelId) return { ...l, completed: true, score, xpEarned, badge }
            if (l.id === levelId + 1) return { ...l, unlocked: true }
            return l
          })
          return {
            levels,
            totalXP: s.totalXP + xpEarned + bonusXP,
          }
        })
      },

      // Pass name directly to avoid any stale-read timing issues
      submitToLeaderboard: (nameOverride) => {
        const { totalXP, leaderboard } = get()
        const playerName = nameOverride || get().playerName
        if (!playerName) return

        const existing = leaderboard.findIndex((e) => e.name === playerName)
        let updated = [...leaderboard]

        if (existing >= 0) {
          if (totalXP > updated[existing].xp) updated[existing] = { name: playerName, xp: totalXP }
        } else {
          updated.push({ name: playerName, xp: totalXP })
        }

        updated = updated.sort((a, b) => b.xp - a.xp).slice(0, 10)
        set({ leaderboard: updated })
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      resetProgress: () =>
        set({
          totalXP: 0,
          levels: defaultLevels,
        }),
    }),
    {
      name: 'crypto-abs-save',
      partialize: (s) => ({
        playerName: s.playerName,
        totalXP: s.totalXP,
        levels: s.levels,
        leaderboard: s.leaderboard,
        soundEnabled: s.soundEnabled,
        musicEnabled: s.musicEnabled,
      }),
    }
  )
)
