import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuHouse, LuUser, LuSearch, LuDisc3, LuBookOpen, LuBookMarked, LuStar, LuPlay, LuBookOpenText, LuDog } from 'react-icons/lu'
import styles from './SongSearch.module.css'

function ScrollingText({ children }) {
  const wrapperRef = useRef(null)
  const innerRef = useRef(null)
  const [overflow, setOverflow] = useState(0)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return
    const check = () => {
      const diff = inner.scrollWidth - wrapper.clientWidth
      setOverflow(diff > 0 ? diff : 0)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [children])

  return (
    <div
      ref={wrapperRef}
      className={`${styles['scroll-text']} ${overflow > 0 ? styles['scroll-text-overflow'] : ''}`}
      style={overflow > 0 ? { '--scroll-distance': `-${overflow + 16}px` } : undefined}
    >
      <span ref={innerRef} className={styles['scroll-text-inner']}>{children}</span>
    </div>
  )
}

function SongEntry({ song, saved, stars, onToggleSave, onStartLesson }) {
  return (
    <div className={styles['song-card']}>
      <div className={styles['disc-wrap']}>
        <LuDisc3 className={styles['disc-icon']} />
      </div>
      <div className={styles['sep']} />
      <div className={`${styles['song-field']} ${styles['field-name']}`}>
        <span className={styles['info-label']}>Song Name</span>
        <span className={styles['info-value']}>{song.name}</span>
      </div>
      <div className={styles['sep']} />
      <div className={`${styles['song-field']} ${styles['field-score']}`}>
        <span className={styles['info-label']}>Score</span>
        <div className={styles['stars']}>
          {[1,2,3,4,5].map(i => (
            <LuStar key={i} className={i <= stars ? styles['star-filled'] : styles['star-empty']} />
          ))}
        </div>
      </div>
      <div className={styles['sep']} />
      <div className={`${styles['song-field']} ${styles['field-artist']}`}>
        <span className={styles['info-label']}>Artist</span>
        <ScrollingText>{song.artist ?? '—'}</ScrollingText>
      </div>
      <div className={styles['sep']} />
      <div className={`${styles['song-field']} ${styles['field-bpm']}`}>
        <span className={styles['info-label']}>BPM</span>
        <span className={styles['info-value']}>{song.tempo}</span>
      </div>
      <div className={styles['sep']} />
      <div className={`${styles['song-field']} ${styles['field-genre']}`}>
        <span className={styles['info-label']}>Genre</span>
        <span className={styles['info-value']}>{song.genre ?? '—'}</span>
      </div>
      <div className={styles['sep']} />
      <button className={styles['play-btn']} onClick={onStartLesson}>
        <LuPlay />
        Start Lesson
      </button>
      <button className={saved ? styles['save-btn-saved'] : styles['save-btn']} onClick={onToggleSave}>
        {saved ? <LuBookMarked /> : <LuBookOpen />}
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

export default function SongSearch() {
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [userSongData, setUserSongData] = useState({})
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all')
  const [genreFilter, setGenreFilter] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    fetch('/api/songs')
      .then(r => r.ok ? r.json() : [])
      .then(setSongs)

    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/user_song_data', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : {})
        .then(setUserSongData)
    }
  }, [])

  function toggleSave(songId) {
    const token = localStorage.getItem('token')
    if (!token) return
    const saved = userSongData[songId]?.saved
    fetch(`/api/songbook/${saved ? 'remove' : 'save'}?song_id=${songId}`, {
      method: saved ? 'DELETE' : 'POST',
      headers: { Authorization: 'Bearer ' + token },
    }).then(r => {
      if (r.ok) {
        setUserSongData(prev => ({
          ...prev,
          [songId]: { ...prev[songId], saved: !saved, best_stars: prev[songId]?.best_stars ?? 0 },
        }))
      }
    })
  }

  const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))].sort()

  const filtered = songs
    .filter(s => s.show_in_search || userSongData[s.id]?.best_stars > 0)
    .filter(s => view === 'songbook' ? userSongData[s.id]?.saved : true)
    .filter(s => !genreFilter || s.genre === genreFilter)
    .filter(s => {
      if (!query) return true
      const q = query.toLowerCase()
      return s.name.toLowerCase().includes(q) || (s.genre ?? '').toLowerCase().includes(q)
    })

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle(styles['visible'], e.isIntersecting)),
      { root: list, rootMargin: '-60px 0px', threshold: 0 }
    )
    Array.from(list.children).forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [filtered])

  return (
    <div className={styles['song-search-page']}>
      <div className={styles['main-panel']}>

        <div className={styles['sidebar']}>
          <Link to="/homepage" className={styles['sidebar-icon-btn']} title="Home">
            <LuHouse />
          </Link>
          <div
            className={`${styles['sidebar-songbook']} ${view === 'all' ? styles['sidebar-songbook-active'] : ''}`}
            onClick={() => setView('all')}
          >
            <LuBookOpenText className={styles['sidebar-songbook-icon']} />
            <span className={styles['sidebar-songbook-label']}>All Songs</span>
          </div>
          <div
            className={`${styles['sidebar-songbook']} ${view === 'songbook' ? styles['sidebar-songbook-active'] : ''}`}
            onClick={() => setView('songbook')}
          >
            <LuBookMarked className={styles['sidebar-songbook-icon']} />
            <span className={styles['sidebar-songbook-label']}>My Songbook</span>
          </div>
        </div>

        <div className={styles['content']}>
          <div className={styles['search-bar']}>
            <LuSearch className={styles['search-icon']} />
            <input
              type="text"
              className={styles['search-input']}
              placeholder="Search for songs..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {genres.length > 0 && (
            <div className={styles['filter-row']}>
              <button
                className={`${styles['filter-btn']} ${genreFilter === null ? styles['filter-btn-active'] : ''}`}
                onClick={() => setGenreFilter(null)}
              >All</button>
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`${styles['filter-btn']} ${genreFilter === genre ? styles['filter-btn-active'] : ''}`}
                  onClick={() => setGenreFilter(g => g === genre ? null : genre)}
                >{genre}</button>
              ))}
            </div>
          )}

          <div className={styles['song-list']} ref={listRef}>
            {filtered.length === 0 && view === 'songbook'
              ? <div className={styles['empty-msg']}>Nothing to see here <LuDog /></div>
              : filtered.map(song => (
                  <SongEntry
                    key={song.id}
                    song={song}
                    saved={userSongData[song.id]?.saved ?? false}
                    stars={userSongData[song.id]?.best_stars ?? 0}
                    onToggleSave={() => toggleSave(song.id)}
                    onStartLesson={() => navigate(`/lesson?song_id=${song.id}`)}
                  />
                ))
            }
          </div>
        </div>

      </div>
      <div className={styles['floor']}></div>
    </div>
  )
}
