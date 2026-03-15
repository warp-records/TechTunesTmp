import styles from './NavBar.module.css'

export default function NavBar() {
  return (
    <nav className={styles['nav']}>
      <div className={styles['logo-text']}>Tech Tunes</div>
      <ul>
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Instructor</a></li>
        <li><a href="#">Admin</a></li>
      </ul>
    </nav>
  )
}
