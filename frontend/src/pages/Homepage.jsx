
import { Route, Link } from 'react-router-dom'

import './Homepage.css'
import LessonIslandImg from '../assets/Homepage/LessonIsland.png'
import TuneStationImg from '../assets/Homepage/TuneStation.png'
import SongSearchImg from '../assets/Homepage/SongSearch.png'
import ProfileImg from '../assets/Homepage/Profile.png'
import ImpactImg from '../assets/Homepage/Impact.png'

export default function Homepage() {
  return (
    <div class="homepage">
      <div id="main-content" class="main-content visible">
        <a href="lesson_island.html" class="lesson-island" aria-label="Lesson Island">
          <img src={LessonIslandImg} alt="Lesson Island" />
        </a>

        <Link to={'/guitar_tuner'}>
          <a class="tune-station" aria-label="Tune Station">
            <img src={TuneStationImg} alt="Tune Station" />
          </a>
        </Link>

        <a href="music.html" class="song-search" aria-label="Song Search">
          <img src={SongSearchImg} alt="Song Search" />
        </a>

        <div class="profile-container">
          <Link to={'/userpage'}>
          <div class="profile" aria-label="Profile">
            <img src={ProfileImg} alt="Profile" />
          </div>
          </Link>
        </div>

        <Link to={'/impact'}>
          <a class="impact" aria-label="Impact">
            <img src={ImpactImg} alt="Impact" />
          </a>
        </Link>
  
        <div id="floating-symbols" class="floating-symbols"></div>
      </div>
      <div class="floor"></div>
    </div>
  )
}
