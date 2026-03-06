import { useCallback } from 'react'
import { Howl } from 'howler'
import { useGameStore } from '../store/useGameStore'

// SFX cache — loaded on first play, shared across components
const sfxCache = {}

function getSfx(name) {
  if (!sfxCache[name]) {
    sfxCache[name] = new Howl({
      src: [`./sounds/${name}.mp3`],
      volume: 0.65,
      onloaderror: () => {},
    })
  }
  return sfxCache[name]
}

// Single bg music instance — lives outside React lifecycle
let bgHowl = null
let bgTrack = null

export function useSound() {
  const soundEnabled = useGameStore((s) => s.soundEnabled)

  // ── SFX ──────────────────────────────────────────────────────────────────
  const play = useCallback(
    (name) => {
      if (!soundEnabled) return
      try { getSfx(name).play() } catch (_) {}
    },
    [soundEnabled]
  )

  // ── Background music ─────────────────────────────────────────────────────
  const playBg = useCallback(
    (track = 'bg-lofi') => {
      if (!soundEnabled) return
      if (bgHowl && bgTrack === track && bgHowl.playing()) return  // already audibly playing

      // Crossfade: stop current if different
      if (bgHowl) {
        const old = bgHowl
        old.fade(old.volume(), 0, 800)
        setTimeout(() => old.stop(), 850)
      }

      bgTrack = track
      bgHowl = new Howl({
        src: [`./sounds/${track}.mp3`],
        volume: 0,
        loop: true,
        onloaderror: () => { bgHowl = null; bgTrack = null },
      })
      bgHowl.play()
      bgHowl.fade(0, 0.18, 1200)
    },
    [soundEnabled]
  )

  const stopBg = useCallback(() => {
    if (!bgHowl) return
    const dying = bgHowl
    bgHowl = null
    bgTrack = null
    dying.fade(dying.volume(), 0, 800)
    setTimeout(() => dying.stop(), 850)
  }, [])

  const switchBg = useCallback(
    (track) => {
      if (bgTrack === track) return
      playBg(track)
    },
    [playBg]
  )

  return { play, playBg, stopBg, switchBg }
}
