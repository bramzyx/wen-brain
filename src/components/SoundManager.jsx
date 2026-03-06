import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'

export default function SoundManager() {
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const { playBg, stopBg } = useSound()

  useEffect(() => {
    if (!soundEnabled) {
      stopBg()
      return
    }

    // Try immediate autoplay — works if browser permits (e.g. Firefox, or returning visitor)
    playBg('bg-lofi')

    // Fallback: on first user interaction, ensure music is playing.
    // playBg deduplicates via bgHowl.playing() so no double-play if already audible.
    const onFirstInteraction = () => playBg('bg-lofi')
    window.addEventListener('click', onFirstInteraction, { once: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [soundEnabled, playBg, stopBg])

  return null
}
