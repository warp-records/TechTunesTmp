import './IslandSelect.css'
import JukeboxImg from '../assets/IslandSelect/Final_Jukebox_Transparent.png'
import GuitarIslandImg from '../assets/IslandSelect/Guitar Island.png'
import PianoIslandImg from '../assets/IslandSelect/Piano Island.png'
import { Link } from 'react-router-dom'

export default function IslandSelect() {
  return (
    <div className="lesson-island-page">
    <div className="jukebox-container">
      <img src={JukeboxImg} alt="Jukebox" className="jukebox-image" />
      <div className="screen-overlay">
        <div className="islands-container">
            <Link to="/guitar_island">
              <div className="island-option guitar-island active" id="guitarOption">
                <img src={GuitarIslandImg} alt="Guitar" className="island-icon" />
                <div className="island-text">GUITAR<br />ISLAND</div>
              </div>
            </Link>
          <div className="island-option piano-island" id="pianoOption">
            <img src={PianoIslandImg} alt="Piano" className="island-icon" />
            <div className="island-text">PIANO<br />ISLAND</div>
            <div className="coming-soon">COMING SOON</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
