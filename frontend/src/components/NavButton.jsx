import { Link } from 'react-router-dom'
import styles from './NavButton.module.css'

export default function NavButton({ to, text, onClick }) {
  return (
    <Link to={to} className={styles['nav-button']} onClick={onClick}>
      {text}
    </Link>
  )
}
