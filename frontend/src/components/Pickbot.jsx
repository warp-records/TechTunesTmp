
import './Pickbot.css'
import pickbot from '../assets/pickbot.png'

export default function Pickbot() {
  return (
    <img className="pickbot-image" src={pickbot}></img>
  )
}

export function Dialogue({ text }) {
  return (
    <div class="dialogue-bubble">{text}</div>
  )
}