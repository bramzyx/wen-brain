import { useEffect } from 'react'
import { Howler } from 'howler'
import { useGameStore } from '../store/useGameStore'
import { playBg, pauseBg } from '../hooks/useSound'

// Unlock audio on mobile (iOS requires a user gesture; autoUnlock handles it)
Howler.autoUnlock = true

export default function SoundManager() {
  const soundEnabled = useGameStore((s) => s.soundEnabled)

  useEffect(() => {
    if (!soundEnabled) {
      pauseBg()
      return
    }

    // Fallback: on first user interaction start music (satisfies autoplay policy)
    const onFirstInteraction = () => playBg()
    window.addEventListener('click',      onFirstInteraction, { once: true })
    window.addEventListener('touchstart', onFirstInteraction, { once: true })
    window.addEventListener('keydown',    onFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click',      onFirstInteraction)
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('keydown',    onFirstInteraction)
    }
  }, [soundEnabled])

  return null
}
