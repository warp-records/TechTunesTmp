import { useEffect, useRef } from 'react'

const FONT_SIZE = 14
const SPEED = 0.3
const FADE = 0.015

export default function BinaryRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const makeGrid = () => {
      const cols = Math.floor(canvas.width / FONT_SIZE)
      const rows = Math.floor(canvas.height / FONT_SIZE)
      return {
        cols,
        rows,
        cells: Array.from({ length: cols }, () =>
          Array.from({ length: rows }, () => ({ char: '0', alpha: 0 }))
        ),
        drops: Array.from({ length: cols }, () => Math.random() * -50),
      }
    }

    let { cols, rows, cells, drops } = makeGrid()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${FONT_SIZE}px monospace`

      for (let c = 0; c < cols; c++) {
        // fade all cells in this column
        for (let r = 0; r < rows; r++) {
          if (cells[c][r].alpha > 0) {
            cells[c][r].alpha = Math.max(0, cells[c][r].alpha - FADE)
          }
        }

        // light up the head cell
        const headRow = Math.floor(drops[c])
        if (headRow >= 0 && headRow < rows) {
          cells[c][headRow].char = Math.random() > 0.5 ? '1' : '0'
          cells[c][headRow].alpha = 1
        }

        // draw all visible cells
        for (let r = 0; r < rows; r++) {
          const alpha = cells[c][r].alpha
          if (alpha <= 0) continue
          const isHead = Math.floor(drops[c]) === r
          ctx.fillStyle = isHead
            ? `rgba(255, 220, 120, ${alpha})`
            : `rgba(247, 147, 26, ${alpha})`
          ctx.fillText(cells[c][r].char, c * FONT_SIZE, r * FONT_SIZE + FONT_SIZE)
        }

        // advance drop
        drops[c] += SPEED
        if (drops[c] * FONT_SIZE > canvas.height && Math.random() > 0.97) {
          drops[c] = Math.random() * -20
        }
      }
    }

    const interval = setInterval(draw, 40)

    const observer = new ResizeObserver(() => {
      resize()
      ;({ cols, rows, cells, drops } = makeGrid())
    })
    observer.observe(canvas)

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  )
}
