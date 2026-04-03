import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import pickbotStupid from '../assets/pickbot_stupid.png'
import brokenGuitar from '../assets/broken_guitar.png'

export default function BadPage() {
  const { user } = useAuth()
  return (
    <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", paddingTop: "60px" }}>
      <p style={{ fontSize: "70px" }}>Page not found rip</p>
      {user
        ? <p style={{ fontSize: '35px' }}>Maybe try <Link to="/homepage" style={{ textDecoration: "none", borderBottom: "2px solid hotpink", color: "hotpink" }}>going home</Link>?</p>
        : <p style={{ fontSize: '35px' }}>Maybe try <Link to="/login" style={{ textDecoration: "none", borderBottom: "2px solid hotpink", color: "hotpink" }}>logging in</Link>?</p>
      }
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
        <img src={pickbotStupid} alt="pickbot stupid" style={{ height: '60vh', width: 'auto' }} />
        <img src={brokenGuitar} alt="broken guitar" style={{ height: '30vh', width: 'auto', marginLeft: '-16vw', marginTop: '50vh', transform: 'rotate(90deg)' }} />
      </div>
    </div>
  )
}
