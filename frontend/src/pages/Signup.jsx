import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import './Signup.css'

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
    <main className="main-container">
      <div className="registration-card">
        <div className="tagline">Guitar lessons that give back</div>
        <div className="subheading">Learn to play while making a difference in your community</div>
        <div className="button-group">
          <Link to="/start" className="button">Get Started</Link>
          <Link to="/login">
            <a className="button secondary">Already have an account?</a>
          </Link>
        </div>
      </div>
    </main>
  )
}
