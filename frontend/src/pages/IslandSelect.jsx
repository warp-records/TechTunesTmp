import { useRef, useState, useEffect } from 'react'
import styles from './IslandSelect.module.css'
import JukeboxImg from '../assets/IslandSelect/Final_Jukebox_Transparent.png'
import GuitarIslandImg from '../assets/IslandSelect/Guitar Island.png'
import PianoIslandImg from '../assets/IslandSelect/Piano Island.png'
import { Link } from 'react-router-dom'
import TutorialPopup, { ArrowIndicator } from '../components/TutorialPopup'
import { useTutorial } from '../components/tutorial'

const TUTORIAL_MESSAGES = ["Open guitar island"]

export default function IslandSelect() {
  const guitarIslandRef = useRef(null)
  const { showTutorial, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES, 3)
  const [arrowPos, setArrowPos] = useState(null)

  useEffect(() => {
    if (!showTutorial) { setArrowPos(null); return }
    const rect = guitarIslandRef.current?.getBoundingClientRect()
    if (rect) setArrowPos({ x: rect.left + rect.width / 2, y: rect.top })
  }, [showTutorial])

  return (
    <div className={styles['lesson-island-page']}>
    <div className={styles['jukebox-container']}>
      <img src={JukeboxImg} alt="Jukebox" className={styles['jukebox-image']} />
      <div className={styles['screen-overlay']}>
        <div className={styles['islands-container']}>
            <Link to="/guitar_island">
              <div ref={guitarIslandRef} className={[styles['island-option'], styles['guitar-island'], styles['active']].join(' ')} id="guitarOption">
                <img src={GuitarIslandImg} alt="Guitar" className={styles['island-icon']} />
                <div className={styles['island-text']}>GUITAR<br />ISLAND</div>
              </div>
            </Link>
          <div className={[styles['island-option'], styles['piano-island']].join(' ')} id="pianoOption">
            <img src={PianoIslandImg} alt="Piano" className={styles['island-icon']} />
            <div className={styles['island-text']}>PIANO<br />ISLAND</div>
            <div className={styles['coming-soon']}>COMING SOON</div>
          </div>
        </div>
      </div>
    </div>
    {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
    {arrowPos && <ArrowIndicator x={arrowPos.x} y={arrowPos.y} direction="down" />}
    </div>
  )
}
