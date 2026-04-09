import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { useMemo } from 'react'
import backgroundDrawing from '../assets/Badpage/background_drawing.png'
import stupidPickBlue from '../assets/Badpage/stupid_pick_blue.png'
import stupidPickLime from '../assets/Badpage/stupid_pick_lime.png'
import stupidPickPink from '../assets/Badpage/stupid_pick_pink.png'
import stupidPickPurple from '../assets/Badpage/stupid_pick_purple.png'
import stupidPickRed from '../assets/Badpage/stupid_pick_red.png'
import stupidPickYellow from '../assets/Badpage/stupid_pick_yellow.png'
import questionMark from '../assets/Badpage/question_mark_draw.png'

const picks = [stupidPickBlue, stupidPickLime, stupidPickPink, stupidPickPurple, stupidPickRed, stupidPickYellow]
const messages = [
  { main: "Page not found RIP", sub: "Maybe it tore in half?" },
  { main: "oops we couldn't find this page", sub: "I looked really hard too" },
  { main: "idk this page", sub: "How did you even get here" },
  { main: "this page is broken", sub: "This is awkward lol..." },
]

export default function BadPage() {
  const { user } = useAuth()
  const pick = useMemo(() => picks[Math.floor(Math.random() * picks.length)], [])
  const { main, sub } = useMemo(() => messages[Math.floor(Math.random() * messages.length)], [])
  return (
    <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", backgroundImage: `url(${backgroundDrawing})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <p style={{ fontSize: "70px", margin: 0, fontWeight: 'bold' }}>{main}</p>
      <p style={{ fontSize: "30px", margin: 0, opacity: 0.8 }}>{sub}</p>
      {user
        ? <p style={{ fontSize: '35px' }}>Try <Link to="/homepage" style={{ textDecoration: "none", borderBottom: "2px solid hotpink", color: "hotpink" }}>going home</Link></p>
        : <p style={{ fontSize: '35px' }}>Try <Link to="/login" style={{ textDecoration: "none", borderBottom: "2px solid hotpink", color: "hotpink" }}>logging in</Link></p>
      }
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '20vh' }} />
        <img src={pick} alt="pick" style={{ height: '50vh', width: 'auto' }} />
        <img src={questionMark} alt="question mark" style={{ height: '20vh', width: 'auto', marginLeft: '2vh' }} />
      </div>
    </div>
  )
}
