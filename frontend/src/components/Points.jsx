import { useState, useEffect, useRef } from 'react'
import styles from './Points.module.css'

export default function Points({ points, animateFrom }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (points === 0 || started.current) return
    started.current = true

    if (animateFrom === undefined || animateFrom >= points) {
      setDisplay(points)
      return
    }

    const duration = 2000
    const from = Math.max(0, animateFrom)
    const startTime = performance.now()

    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (points - from) * eased))
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [points])

  const isAnimating = animateFrom !== undefined && animateFrom < points

  return (
    <div className={[styles.points, isAnimating ? styles.animating : ''].join(' ').trim()}>
      ⭐ {display.toLocaleString()} pts
    </div>
  )
}
