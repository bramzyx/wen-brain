import { useCallback } from 'react'
import { Howl, Howler } from 'howler'
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

const bgMusic = new Howl({
  src: ['/sounds/bg-lofi.mp3'],
  loop: true,
  volume: 0.5,
  html5: false,
})

export const playBg = () => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume()
  }
  if (!bgMusic.playing()) {
    bgMusic.play()
  }
}

export const pauseBg = () => {
  bgMusic.pause()
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
