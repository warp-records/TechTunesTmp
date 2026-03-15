import { Link } from 'react-router-dom'
import styles from './HomeButton.module.css'

export default function HomeButton() {
  return (
    <Link to="/homepage" className={styles['home-button']} title="Go to Home">
      🏠
    </Link>
  )
}
