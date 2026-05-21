import { Link } from 'react-router-dom'
import styles from './NavButton.module.css'

export default function NavButton({ to, text, onClick, disabled }) {
  if (disabled) {
    return <span className={[styles['nav-button'], styles['nav-button-disabled']].join(' ')}>{text}</span>
  }
  return (
    <Link to={to} className={styles['nav-button']} onClick={onClick}>
      {text}
    </Link>
  )
}
