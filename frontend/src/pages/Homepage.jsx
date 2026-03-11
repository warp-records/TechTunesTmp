import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './Homepage.css'
import LessonIslandImg from '../assets/Homepage/LessonIsland.png'
import TuneStationImg from '../assets/Homepage/TuneStation.png'
import SongSearchImg from '../assets/Homepage/SongSearch.png'
import ProfileImg from '../assets/Homepage/Profile.png'
import ImpactImg from '../assets/Homepage/Impact.png'


export default function Homepage() {
  const navigate = useNavigate()
  const homepageRef = useRef(null)
  const lessonIslandRef = useRef(null)

  function handleLessonIslandClick() {
    const island = lessonIslandRef.current
    const homepage = homepageRef.current
    if (!island || !homepage) return

    const rect = island.getBoundingClientRect()
    const centerX = ((rect.left + rect.width / 2) / window.innerWidth) * 100
    const centerY = ((rect.top + rect.height / 2) / window.innerHeight) * 100

    homepage.style.transformOrigin = `${centerX}% ${centerY}%`
    homepage.classList.add('zoom-to-lesson')

    setTimeout(() => {
      navigate('/island_select')
    }, 800)
  }

  return (
    <div ref={homepageRef} className="homepage bg-ready">
      <div className="loading-screen hidden">
        <div className="loading-content">
          <div className="music-note-container">
            <div className="music-note">♪</div>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>

      <div id="main-content" className="main-content visible">
        <div ref={lessonIslandRef} className="lesson-island" aria-label="Lesson Island" onClick={handleLessonIslandClick}>
          <img src={LessonIslandImg} alt="Lesson Island" />
        </div>

        <Link to="/guitar_tuner" className="tune-station" aria-label="Tune Station">
          <img src={TuneStationImg} alt="Tune Station" />
        </Link>

        <Link to="/song_search" className="song-search" aria-label="Song Search">
          <img src={SongSearchImg} alt="Song Search" />
        </Link>

        <div className="profile-container">
          <Link to="/userpage" className="profile" aria-label="Profile">
            <img src={ProfileImg} alt="Profile" />
          </Link>
        </div>

        <Link to="/impact" className="impact" aria-label="Impact">
          <img src={ImpactImg} alt="Impact" />
        </Link>

        <div id="floating-symbols" className="floating-symbols"></div>
      </div>
      <div className="floor"></div>
    </div>
  )
}
