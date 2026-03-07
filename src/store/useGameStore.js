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
      xUser: null,      // { username, displayName, avatarUrl, xId }
      isVisitor: false, // guest mode — levels 1-3 only, no leaderboard

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
      setXUser: (user) => set({ xUser: user, isVisitor: false }),
      setVisitor: () => set({ isVisitor: true, xUser: null }),
      // Full sign-out: wipe identity, reset to clean slate
      logout: () => {
        localStorage.removeItem('xUser')
        localStorage.removeItem('wen-brain-save')
        set({
          xUser: null,
          isVisitor: false,
          playerName: '',
          totalXP: 0,
          levels: defaultLevels,
        })
      },
      clearXUser: () => set({ xUser: null, isVisitor: false, playerName: '' }),

      addXP: (amount) => set((s) => ({ totalXP: s.totalXP + amount })),

      completeLevel: (levelId, score, xpEarned) => {
        console.log('[WenBrain] completeLevel called:', levelId, score, xpEarned)
        const { totalXP, levels } = get()
        const alreadyCompleted = levels.find((l) => l.id === levelId)?.completed
        if (alreadyCompleted) return

        const perfect = score === 3
        const badge = perfect ? 'WAGMI' : null
        const bonusXP = perfect ? 150 : 0
        const newXP = totalXP + xpEarned + bonusXP
        const newLevelsCompleted = levels.filter((l) => l.completed).length + 1

        set((s) => {
          const updatedLevels = s.levels.map((l) => {
            if (l.id === levelId) return { ...l, completed: true, score, xpEarned, badge }
            if (l.id === levelId + 1) return { ...l, unlocked: true }
            return l
          })
          return { levels: updatedLevels, totalXP: newXP }
        })

        const xUserStr = localStorage.getItem('xUser')
        if (!xUserStr) return
        const xUser = JSON.parse(xUserStr)

        console.log('[WenBrain] xUser from localStorage:', xUser)

        fetch('https://tubular-dieffenbachia-b254bc.netlify.app/.netlify/functions/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: xUser.username,
            profile_picture: xUser.profilePicture || xUser.avatarUrl || null,
            xp: newXP,
            levels_completed: newLevelsCompleted,
          }),
        })
          .then((r) => r.json())
          .then((d) => console.log('[WenBrain] Leaderboard saved:', d))
          .catch((e) => console.error('[WenBrain] Error:', e))
      },

      submitScoreToSupabase: async () => {
        console.log('[WenBrain] Inside submitScoreToSupabase!')
        const state = get()
        const xUserStr = localStorage.getItem('xUser')
        if (!xUserStr) return
        try {
          const user = JSON.parse(xUserStr)
          const payload = {
            username: user.username,
            profile_picture: user.profilePicture || user.avatarUrl || null,
            xp: state.totalXP || 0,
            levels_completed: state.levels ? state.levels.filter((l) => l.completed).length : 0,
          }
          const res = await fetch('https://tubular-dieffenbachia-b254bc.netlify.app/.netlify/functions/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) {
            console.error('[WenBrain] Supabase sync failed:', res.status)
          } else {
            console.log('[WenBrain] Score secured on Supabase!', payload)
          }
        } catch (err) {
          console.error('[WenBrain] Leaderboard error:', err)
        }
      },

      // Sync current localStorage XP to Supabase — call on app load
      syncToLeaderboard: () => {
        const { xUser, totalXP, levels } = get()
        console.log('[WenBrain] xUser:', xUser)
        if (!xUser?.username) return
        const levels_completed = levels.filter((l) => l.completed).length
        console.log('[WenBrain] Submitting to leaderboard:', { username: xUser.username, xp: totalXP, levels_completed })
        fetch('https://tubular-dieffenbachia-b254bc.netlify.app/.netlify/functions/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: xUser.username,
            profile_picture: xUser.avatarUrl ?? null,
            xp: totalXP,
            levels_completed,
          }),
        })
          .then(async (res) => {
            console.log('[WenBrain] Leaderboard response:', await res.json())
          })
          .catch((error) => {
            console.error('[WenBrain] Leaderboard error:', error)
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
          xId: xUser?.xId ?? null,
          xp: totalXP,
          avatarUrl: xUser?.avatarUrl ?? null,
          isXUser: !!xUser,
          levelsCompleted,
          wagmiBadges,
        }

        // Deduplicate by xId for X users, fallback to name for guests
        const existing = leaderboard.findIndex((e) =>
          xUser?.xId ? e.xId === xUser.xId : e.name === playerName
        )
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
        isVisitor: s.isVisitor,
      }),
    }
  )
)
