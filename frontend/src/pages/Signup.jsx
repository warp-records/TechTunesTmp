import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import styles from './Signup.module.css'

export default function Signup() {
  return (
    <>
      <NavBar />
      <MainContainer />
      <Footer />
    </>
  )
}

function MainContainer() {
  return (
    <main className={styles['main-container']}>
      <div className={styles['registration-card']}>
        <div className={styles['tagline']}>Guitar lessons that give back</div>
        <div className={styles['subheading']}>Learn to play while making a difference in your community</div>
        <div className={styles['button-group']}>
          <Link to="/start" className={styles['button']}>Get Started</Link>
          <Link to="/login">
            <a className={[styles['button'], styles['secondary']].join(' ')}>Already have an account?</a>
          </Link>
        </div>
      </div>
    </main>
  )
}
