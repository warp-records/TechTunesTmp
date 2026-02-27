import { Link } from 'react-router-dom'
import './HomeButton.css'

export default function HomeButton() {
  return (
    <Link to="/homepage" className="home-button" title="Go to Home">
      🏠
    </Link>
  )
}
