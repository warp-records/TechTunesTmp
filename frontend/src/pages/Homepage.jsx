import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import styles from './Homepage.module.css'
import LessonIslandImg from '../assets/Homepage/LessonIsland.png'
import TuneStationImg from '../assets/Homepage/TuneStation.png'
import SongSearchImg from '../assets/Homepage/SongSearch.png'
import ProfileImg from '../assets/Homepage/Profile.png'
import ImpactImg from '../assets/Homepage/Impact.png'


export default function Homepage() {
  const navigate = useNavigate()
  const homepageRef = useRef(null)
  const lessonIslandRef = useRef(null)
  const [zooming, setZooming] = useState(false)

  function handleLessonIslandClick() {
    const island = lessonIslandRef.current
    const homepage = homepageRef.current
    if (!island || !homepage) return

    const rect = island.getBoundingClientRect()
    const centerX = ((rect.left + rect.width / 2) / window.innerWidth) * 100
    const centerY = ((rect.top + rect.height / 2) / window.innerHeight) * 100

    homepage.style.transformOrigin = `${centerX}% ${centerY}%`
    setZooming(true)

    setTimeout(() => {
      navigate('/island_select')
    }, 800)
  }

  return (
    <div ref={homepageRef} className={[styles['homepage'], styles['bg-ready'], zooming ? styles['zoom-to-lesson'] : ''].filter(Boolean).join(' ')}>
      <div className={[styles['loading-screen'], styles['hidden']].join(' ')}>
        <div className={styles['loading-content']}>
          <div className={styles['music-note-container']}>
            <div className={styles['music-note']}>♪</div>
          </div>
          <div className={styles['loading-bar']}>
            <div className={styles['loading-progress']}></div>
          </div>
        </div>
      </div>

      <div id="main-content" className={[styles['main-content'], styles['visible']].join(' ')}>
        <div ref={lessonIslandRef} className={styles['lesson-island']} aria-label="Lesson Island" onClick={handleLessonIslandClick}>
          <img src={LessonIslandImg} alt="Lesson Island" />
        </div>

        <Link to="/guitar_tuner" className={styles['tune-station']} aria-label="Tune Station">
          <img src={TuneStationImg} alt="Tune Station" />
        </Link>

        <Link to="/song_search" className={styles['song-search']} aria-label="Song Search">
          <img src={SongSearchImg} alt="Song Search" />
        </Link>

        <div className={styles['profile-container']}>
          <Link to="/userpage" className={styles['profile']} aria-label="Profile">
            <img src={ProfileImg} alt="Profile" />
          </Link>
        </div>

        <Link to="/impact" className={styles['impact']} aria-label="Impact">
          <img src={ImpactImg} alt="Impact" />
        </Link>

        <div id="floating-symbols" className={styles['floating-symbols']}></div>
      </div>
      <div className={styles['floor']}></div>
    </div>
  )
}
