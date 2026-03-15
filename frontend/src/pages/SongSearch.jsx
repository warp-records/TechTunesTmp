import styles from './SongSearch.module.css'
import HomeButton from '../components/HomeButton'

export default function SongSearch() {
  return (
    <div className={styles['song-search-page']}>
      <HomeButton />
      <div className={styles['wip-container']}>
        <h1>Work in Progress</h1>
      </div>
      <div className={styles['floor']}></div>
    </div>
  )
}
