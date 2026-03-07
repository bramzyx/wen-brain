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
      xUser: null, // { username, displayName, avatarUrl, accessToken }

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
      setXUser: (user) => set({ xUser: user }),
      clearXUser: () => set({ xUser: null }),

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
        const { totalXP, leaderboard, levels, xUser } = get()
        const playerName = nameOverride || get().playerName
        if (!playerName) return

        const levelsCompleted = levels.filter((l) => l.completed).length
        const wagmiBadges = levels.filter((l) => l.badge === 'WAGMI').length

        const entry = {
          name: playerName,
          xp: totalXP,
          avatarUrl: xUser?.avatarUrl ?? null,
          isXUser: !!xUser,
          levelsCompleted,
          wagmiBadges,
        }

        const existing = leaderboard.findIndex((e) => e.name === playerName)
        let updated = [...leaderboard]

        if (existing >= 0) {
          // Keep best XP, always update profile data
          updated[existing] = { ...entry, xp: Math.max(updated[existing].xp, totalXP) }
        } else {
          updated.push(entry)
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
          xUser: null,
          playerName: '',
        }),
    }),
    {
      name: 'wen-brain-save',
      partialize: (s) => ({
        playerName: s.playerName,
        totalXP: s.totalXP,
        levels: s.levels,
        leaderboard: s.leaderboard,
        soundEnabled: s.soundEnabled,
        musicEnabled: s.musicEnabled,
        xUser: s.xUser,
      }),
    }
  )
)
