import './IslandSelect.css'
import JukeboxImg from '../assets/Homepage/LessonIsland/Final_Jukebox_Transparent.png'

export default function IslandSelect() {
  return (
    <div className="lesson-island-page">
    <div className="jukebox-container">
      <img src={JukeboxImg} alt="Jukebox" className="jukebox-image" />
    </div>
    </div>
  )
}
