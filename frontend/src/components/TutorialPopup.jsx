import { useEffect, useState } from 'react'
import styles from './TutorialPopup.module.css'
import neonArrow from '../assets/Tutorial/blue-neon-arrow-2.png'

export default function TutorialPopup({ messages, index, setIndex, onClose }) {
  const [displayed, setDisplayed] = useState("")

  const text = messages[index]

  useEffect(() => {
    setDisplayed("")
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, ++i))
      if (i >= text.length) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [text])

  return (
    <div className={styles['tutorial-popup']}>
      <button className={styles['tutorial-popup-close']} onClick={onClose}>✕</button>
      <div className={styles['tutorial-popup-text']}>
        <p className={styles['tutorial-popup-sizer']}>{text}</p>
        <p className={styles['tutorial-popup-display']}>{displayed}</p>
      </div>
      <button className={styles['tutorial-popup-next']} onClick={() => index === messages.length - 1 ? onClose() : setIndex(i => i + 1)}>
        {index === messages.length - 1 ? 'Close' : 'Next'}
      </button>
    </div>
  )
}

const ARROW_W = 120
const ARROW_H = 60

const directionOffset = {
  right: (x, y) => ({ left: x - ARROW_W,  top: y - ARROW_H / 2 }),
  left:  (x, y) => ({ left: x,            top: y - ARROW_H / 2 }),
  up:    (x, y) => ({ left: x - ARROW_W / 2, top: y - ARROW_H / 2 + ARROW_W / 2 }),
  down:  (x, y) => ({ left: x - ARROW_W / 2, top: y - ARROW_H / 2 - ARROW_W / 2 }),
}

export function ArrowIndicator({ x, y, direction = 'right' }) {
  return (
    <img
      src={neonArrow}
      className={[styles['arrow-base'], styles[`arrow-${direction}`]].join(' ')}
      style={directionOffset[direction](x, y)}
    />
  )
}
