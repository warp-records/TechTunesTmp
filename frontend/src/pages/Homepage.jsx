import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import styles from './Homepage.module.css'
import TutorialPopup, { ArrowIndicator } from '../components/TutorialPopup'
import { useTutorial } from '../components/tutorial'

const TUTORIAL_MESSAGES = [
  "You can tune your instrument here",
  "Check out the impact page!",
  "Click Lesson Island to start learning!",
]
import LessonIslandImg from '../assets/Homepage/LessonIsland.png'
import TuneStationImg from '../assets/Homepage/TuneStation.png'
import SongSearchImg from '../assets/Homepage/SongSearch.png'
import ProfileImg from '../assets/Homepage/Profile.png'
import ImpactImg from '../assets/Homepage/Impact.png'


export default function Homepage() {
  const navigate = useNavigate()
  const homepageRef = useRef(null)
  const lessonIslandRef = useRef(null)
  const tuneStationRef = useRef(null)
  const impactRef = useRef(null)
  const [zooming, setZooming] = useState(false)
  const { tutorialIndex, showTutorial, start: startTutorial, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES)
  const [arrowPos, setArrowPos] = useState(null)

  useEffect(() => {
    if (!showTutorial) { setArrowPos(null); return }
    if (tutorialIndex === 0) {
      // bounding rect here calculates weird for some reason
      const rect = tuneStationRef.current?.getBoundingClientRect()
      if (rect) setArrowPos({ x: rect.left + 350, y: rect.top + rect.height / 2, direction: 'left' })
    } else if (tutorialIndex === 1) {
      const rect = impactRef.current?.getBoundingClientRect()
      if (rect) setArrowPos({ x: rect.left + rect.width / 2, y: rect.bottom, direction: 'up' })
    } else if (tutorialIndex === 2) {
      const rect = lessonIslandRef.current?.getBoundingClientRect()
      if (rect) setArrowPos({ x: rect.left + 100, y: rect.top + rect.height / 2, direction: 'right' })
    }
  }, [showTutorial, tutorialIndex])

  function handleLessonIslandClick() {
    const island = lessonIslandRef.current
    const homepage = homepageRef.current
    if (!island || !homepage) return

    const rect = island.getBoundingClientRect()
    const centerX = ((rect.left + rect.width / 2) / window.innerWidth) * 100
    const centerY = (rect.top / window.innerHeight) * 100 + 6.12

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
          <img ref={tuneStationRef} src={TuneStationImg} alt="Tune Station" />
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
          <img ref={impactRef} src={ImpactImg} alt="Impact" />
        </Link>

        <div id="floating-symbols" className={styles['floating-symbols']}></div>
      </div>
      <div className={styles['floor']}></div>
      {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
      {arrowPos && <ArrowIndicator x={arrowPos.x} y={arrowPos.y} direction={arrowPos.direction} />}
    </div>
  )
}
