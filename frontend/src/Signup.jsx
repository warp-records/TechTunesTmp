import { Link } from 'react-router-dom'

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

function NavBar() {
  return (<nav>
    <div className="logo-text">Tech Tunes</div>
    <ul>
      <li><a href="#">Features</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Instructor</a></li>
      <li><a href="#">Admin</a></li>
    </ul>
  </nav>)
}

function Footer() {
  return (
    <footer>
      © 2025 Tech Tunes ·
      <a href="#">Terms</a> |
      <a href="#">Privacy</a> |
      <a href="#">Contact</a>
    </footer>
  )
}

function MainContainer() {
  return (
    <>
      <main class="main-container">
        <div class="registration-card">
          <div class="tagline">Guitar lessons that give back</div>
          <div class="subheading">Learn to play while making a difference in your community</div>
          <div class="button-group">
            <Link to="/start">
              <a class="button">Get Started</a>
            </Link>
            <a class="button secondary">Already have an account?</a>
          </div>
        </div>
      </main>
    </>
  )
}