import styles from './IslandSelect.module.css'
import JukeboxImg from '../assets/IslandSelect/Final_Jukebox_Transparent.png'
import GuitarIslandImg from '../assets/IslandSelect/Guitar Island.png'
import PianoIslandImg from '../assets/IslandSelect/Piano Island.png'
import { Link } from 'react-router-dom'

export default function IslandSelect() {
  return (
    <div className={styles['lesson-island-page']}>
    <div className={styles['jukebox-container']}>
      <img src={JukeboxImg} alt="Jukebox" className={styles['jukebox-image']} />
      <div className={styles['screen-overlay']}>
        <div className={styles['islands-container']}>
            <Link to="/guitar_island">
              <div className={[styles['island-option'], styles['guitar-island'], styles['active']].join(' ')} id="guitarOption">
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
    </div>
  )
}
