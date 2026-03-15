
import styles from './Pickbot.module.css'
import pickbot from '../assets/pickbot.png'

export default function Pickbot() {
  return (
    <img className={styles['pickbot-image']} src={pickbot}></img>
  )
}

export function Dialogue({ text }) {
  return (
    <div className={styles['dialogue-bubble']}>{text}</div>
  )
}