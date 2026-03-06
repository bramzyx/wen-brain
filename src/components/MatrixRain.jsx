import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₿ΞÐSATOSHIWAGMIREKTDEFI'
const FONT_SIZE = 14
const SPEED    = 0.35

export default function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w, h, cols, drops, raf

    const init = () => {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
      cols  = Math.floor(w / FONT_SIZE)
      drops = Array.from({ length: cols }, () => Math.random() * (h / FONT_SIZE))
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(8,11,17,0.12)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${FONT_SIZE}px monospace`

      for (let i = 0; i < cols; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * FONT_SIZE
        const y = Math.floor(drops[i]) * FONT_SIZE

        ctx.fillStyle = `rgba(0,255,65,${0.7 + Math.random() * 0.3})`
        ctx.fillText(char, x, y)

        drops[i] += SPEED

        if (drops[i] * FONT_SIZE > h && Math.random() > 0.97) {
          drops[i] = -Math.floor(Math.random() * 20)
        }
      }

      raf = requestAnimationFrame(draw)
    }

    init()
    draw()

    const onResize = () => {
      cancelAnimationFrame(raf)
      init()
      draw()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        opacity: 0.18,
        pointerEvents: 'none',
      }}
    />
  )
}
