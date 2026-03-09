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

let bgAudio = null

export const playBg = () => {
  if (!bgAudio) {
    bgAudio = new Audio('/sounds/bg-lofi.mp3')
    bgAudio.loop = true
    bgAudio.volume = 0.5
  }
  const playPromise = bgAudio.play()
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error('BGM Error (Firefox/Brave block):', error)
    })
  }
}

export const pauseBg = () => {
  if (bgAudio) {
    bgAudio.pause()
  }
}

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

  return { play, playBg, pauseBg }
}
