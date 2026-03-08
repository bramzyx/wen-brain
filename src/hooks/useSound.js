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

const playBg = () => {
  const audio = document.getElementById('global-bg-music')
  if (audio) {
    audio.volume = 0.2
    audio.play().catch(e => console.error('DOM Audio Error:', e))
  }
}

const pauseBg = () => {
  const audio = document.getElementById('global-bg-music')
  if (audio) audio.pause()
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
