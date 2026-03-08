import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { playBg, pauseBg } from '../hooks/useSound'

export default function SoundManager() {
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const hasInteracted = useRef(false)

  useEffect(() => {
    const onInteraction = () => {
      hasInteracted.current = true
    }
    window.addEventListener('click', onInteraction, { once: true })
    window.addEventListener('touchstart', onInteraction, { once: true })
    return () => {
      window.removeEventListener('click', onInteraction)
      window.removeEventListener('touchstart', onInteraction)
    }
  }, [])

  useEffect(() => {
    if (soundEnabled) {
      playBg().catch(() => {})
    } else {
      pauseBg()
    }
  }, [soundEnabled])

  return null
}
