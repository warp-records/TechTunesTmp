import { Link } from 'react-router-dom'
import { LuHouse, LuUser, LuBookPlus, LuSearch, LuDisc3, LuBookOpen } from 'react-icons/lu'
import styles from './SongSearch.module.css'

const PLACEHOLDER_SONGS = [
  { id: 1, name: 'Guillotine',           artist: 'Death Grips', bpm: 140, genre: 'Experimental Hip-Hop' },
  { id: 2, name: 'Takyon',               artist: 'Death Grips', bpm: 155, genre: 'Noise Rap'            },
  { id: 3, name: 'I\'ve Seen Footage',   artist: 'Death Grips', bpm: 137, genre: 'Experimental Hip-Hop' },
  { id: 4, name: 'Hustle Bones',         artist: 'Death Grips', bpm: 158, genre: 'Noise Rap'            },
  { id: 5, name: 'No Love',              artist: 'Death Grips', bpm: 143, genre: 'Industrial Hip-Hop'   },
  { id: 6, name: 'The Fever (Aye Aye)',  artist: 'Death Grips', bpm: 162, genre: 'Experimental Hip-Hop' },
]

export default function SongSearch() {
  return (
    <div className={styles['song-search-page']}>
      <div className={styles['main-panel']}>

        <div className={styles['sidebar']}>
          <Link to="/homepage" className={styles['sidebar-icon-btn']} title="Home">
            <LuHouse />
          </Link>
          <Link to="/userpage" className={styles['sidebar-icon-btn']} title="Profile">
            <LuUser />
          </Link>
          <div className={styles['sidebar-songbook']}>
            <LuBookPlus className={styles['sidebar-songbook-icon']} />
            <span className={styles['sidebar-songbook-label']}>My Songbook</span>
          </div>
        </div>

        <div className={styles['content']}>
          <div className={styles['search-bar']}>
            <LuSearch className={styles['search-icon']} />
            <input
              type="text"
              className={styles['search-input']}
              placeholder="Search for songs... (e.g., Bohemian Rhapsody)"
            />
          </div>

          <div className={styles['song-list']}>
            {PLACEHOLDER_SONGS.map(song => (
              <div key={song.id} className={styles['song-card']}>
                <LuBookPlus className={styles['card-add-icon']} />
                <div className={styles['disc-wrap']}>
                  <LuDisc3 className={styles['disc-icon']} />
                </div>
                <div className={styles['sep']} />
                <div className={styles['song-field']}>
                  <span className={styles['info-label']}>Song Name</span>
                  <span className={styles['info-value']}>{song.name}</span>
                </div>
                <div className={styles['sep']} />
                <div className={styles['song-field']}>
                  <span className={styles['info-label']}>Artist</span>
                  <span className={styles['info-value']}>{song.artist}</span>
                </div>
                <div className={styles['sep']} />
                <div className={styles['song-field']}>
                  <span className={styles['info-label']}>BPM</span>
                  <span className={styles['info-value']}>{song.bpm}</span>
                </div>
                <div className={styles['sep']} />
                <div className={styles['song-field']}>
                  <span className={styles['info-label']}>Genre</span>
                  <span className={styles['info-value']}>{song.genre}</span>
                </div>
                <div className={styles['sep']} />
                <button className={styles['save-btn']}>
                  <LuBookOpen />
                  Save to Songbook
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
      <div className={styles['floor']}></div>
    </div>
  )
}
