import { useCallback } from 'react'
import { Howl } from 'howler'
import { useGameStore } from '../store/useGameStore'

// SFX cache — loaded on first play, shared across components
const sfxCache = {}

function getSfx(name) {
  if (!sfxCache[name]) {
    sfxCache[name] = new Howl({
      src: [`/sounds/${name}.mp3`],
      volume: 0.65,
      onloaderror: () => {},
    })
  }
  return sfxCache[name]
}

// Background music singleton — lives outside React lifecycle
const bgAudio = new Audio('/sounds/bg-lofi.mp3')
bgAudio.loop = true
bgAudio.volume = 0.18

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
    () => {
      bgAudio.play().catch(error => console.error('BGM Play Error:', error))
    },
    []
  )

  const stopBg = useCallback(() => {
    bgAudio.pause()
    bgAudio.currentTime = 0
  }, [])

  const switchBg = useCallback(
    (_track) => {
      playBg()
    },
    [playBg]
  )

  return { play, playBg, stopBg, switchBg }
}
