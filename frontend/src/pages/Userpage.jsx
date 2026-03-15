
import { useState, useEffect } from 'react'
import { Route, Link, useNavigate } from 'react-router-dom'

import Avatar from "../components/Avatar"
import styles from './Userpage.module.css'

const suggestedSongs = [
  { title: "Get Got", subtitle: "Death Grips", stars: 5, },
  { title: "Tout Naturel", subtitle: "Lucy Bedroque", stars: 4, },
  { title: "Bloody Mary", subtitle: "SpaceGhostPurrp", stars: 3, },
  { title: "Radiation", subtitle: "Lil Ugly Mane", stars: 4, },
  { title: "Excursions", subtitle: "A Tribe Called Quest", stars: 2, },
]

const songBook = [
  { title: "Kendo Thugs", subtitle: "Yabujin", stars: 3, },
  { title: "DIAMONDHEAD", subtitle: "JoeB", stars: 5, },
  { title: "Clipper", subtitle: "Autechre", stars: 4, },
  { title: "TANK", subtitle: "Space Laces", stars: 5, },
  { title: "Sevntrack", subtitle: "Speedy J", stars: 4, },
]

const spotifySongs = [
  { title: "Slowly", subtitle: "Amon Tobin", stars: 4, },
  { title: "Sunshine Recorder", subtitle: "Boards of Canada", stars: 3, },
  { title: "Slowly", subtitle: "Amon Tobin", stars: 3, },
  { title: "Lost In Dreams 19", subtitle: "Irini", stars: 4, },
  { title: "Lick The Rainbow", subtitle: "Mord Fustang", stars: 5, },
  { title: "Blue", subtitle: "Au5", stars: 4, },
]

const genres = [
  { title: "Hip-Hop", subtitle: "", stars: 5, },
  { title: "IDM", subtitle: "", stars: 4, },
  { title: "Techno", subtitle: "", stars: 5, },
  { title: "Dariacore", subtitle: "", stars: 3, },
  { title: "Avante-garde", subtitle: "", stars: 4, },
]


export default function Userpage() {
  let [username, setUsername] = useState("");
  
  const friends = [
    { "name": "Alexa", "online": true, },
    { "name": "Alex", "online": false, },
    { "name": "Ethan", "online": true, },
    { "name": "Max", "online": false, }
  ]
  
  const leaderboard = [
    { "name": "Alexa", "song": "Sweet Child O' Mine", score: 1000 },
    { "name": "Ethan", "song": "Mean Mr Mustard", score: 850 },
    { "name": "Max", "song": "I'm The Problem", score: 700 },
  ]
  
  const [avatarData, setAvatarData] = useState(null);
  const navigate = useNavigate();
  
  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function getAvatar() {
      const res = await fetch('/api/get-avatar/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarData(data.avatar);
      }
    }
    getAvatar();
    
    setUsername(localStorage.getItem("username"));
  }, []);
  
  return (
  <div className={styles['userpage-root']}>
    <header className={styles['page-header']}>
        <nav className={[styles['nav'], styles['container']].join(' ')} aria-label="Top Navigation">
          <div className={styles['nav-left']}>
            <Link to={'/homepage'}>
              <div className={styles['chip']} title="Go to Home">🏠</div>
            </Link>
          </div>
          <div className={styles['logo']}>🎧 TuneVerse 🎶</div>
          <div className={styles['nav-right']}>
            <details className={styles['settings']}>
              <summary className={styles['chip']} role="button" aria-haspopup="menu">☰ Settings ▾</summary>
              <div className={styles['menu']} role="menu">
                <a role="menuitem">Add Friends</a>
                <a role="menuitem">Edit PickBot</a>
                <a role="menuitem">Privacy Settings</a>
                <a role="menuitem">Add Spotify</a>
                <a role="menuitem">Add Apple Music</a>
                <a role="menuitem">SongBook</a>
                <a role="menuitem" className={styles['logout']} onClick={logout}>Log out</a>
              </div>
            </details>
          </div>
        </nav>
      </header>

    <main className={styles['container']}>
    <section id="avatar" aria-labelledby="avatar-title">
        <div className={styles['avatar-welcome']}>
          <h2 id="avatar-title" className={styles['avatar-welcome-title']}>Welcome to TuneVerse</h2>
          <div className={styles['pickbot-speech-bubble']}>
              Hello, <span id="username-display">{username}</span>!
                </div>
                
              <div className={styles['userpage-avatar']}>
                {avatarData && <Avatar form={avatarData["form"]} activeItems={avatarData["activeItems"]} bodyTexture={avatarData["bodyTexture"]} />}
              </div>
        </div>
      </section>
        
    <section id="lessons" aria-labelledby="lessons-title">
      <h3 className={styles['section-title']}>Lesson Island</h3>
      <div className={styles['lessons-grid']}>
        <LessonCard 
        instrument={"Guitar"}
        emoji={"🎸"}
        completed={10}
        total={25}
        />
        
        <LessonCard 
        instrument={"Piano"}
        emoji={"🎹"}
        completed={2}
        total={25}
        />
        
        <LessonCard 
        instrument={"Drums"}
        emoji={"🥁"}
        completed={15}
        total={25}
        />
      </div>
    </section>
    
        <SongRow title={"Suggested Songs (by Skill Level)"} songs={suggestedSongs} />
        <SongRow title={"SongBook"} songs={songBook} />
        
        <section id="friends">
          <h3 className={styles['section-title']} id="friends-title">Friends</h3>
          <div className={styles['friends-wrap']}>
            {
              friends.map((friend, index) => {
                return <Friend key={index} name={friend["name"]} isOnline={friend["online"]} />
              })
          }
          
            <div className={styles['friend']}>
              <div className={styles['pfp']} aria-hidden="true">+</div>
                <div>More Friends</div>
              </div>
            </div>
            
        </section>
        
        <section id="leaderboard" aria-labelledby="leaderboard-title">
          <h3 className={styles['section-title']} id="leaderboard-title">Leaderboard</h3>
          <div className={styles['leaderboard-grid']}>
            {
              leaderboard.map((entry) => {
                return <LeaderBoardCard friend={entry["name"]} song={entry["song"]} score={entry["score"]} />
              })
            }
          </div>
        </section>
        
        <SongRow title={"Songs from Spotify"} songs={spotifySongs} />
        <SongRow title={"Pick Your Genre"} songs={genres} />
        
  </main>
  </div>
  )
}

// progress as 
export function LessonCard({ instrument, emoji, completed, total }) {
  
  return (
    <div className={[styles['lesson-card'], styles['card']].join(' ')}>
      <h4>{emoji} {instrument}</h4>
      <div className={styles['progress']}><span style={{width: `${completed/total*100}%`}}></span></div>
      <div className={styles['tiny']}>{completed} / {total} lessons</div>
      <div style={{ marginTop: '16px' }}><a href="" className={styles['chip']}>Continue {instrument}</a></div>
    </div>
  )
}

// songs: [
//   {
//     "title": string,
//     "subtitle": string,
//     "stars": int,
//   }
// ]
export function SongRow({ title, songs }) {
  
  return (
    <section>
      <h3 className={styles['section-title']} id="suggested-title">{title}</h3>
      <div className={[styles['row'], styles['card']].join(' ')}>
        <div className={[styles['arrow'], styles['left']].join(' ')} data-arrow="left" data-row="suggested" tabIndex="0" aria-label="Scroll left">‹</div>
        <div className={styles['row-track']} id="row-suggested">
          {
            songs.map(song => <SongTile
              title={song["title"]}
              subtitle={song["subtitle"]}
              stars={song["stars"]} />)
          }
        </div>
        <div className={[styles['arrow'], styles['right']].join(' ')} data-arrow="right" data-row="suggested" tabIndex="0" aria-label="Scroll right">›</div>
      </div>
    </section>
  )
}

export function SongTile({ title, subtitle, stars }) {
  return (
    <div className={styles['tile']}>
      <div className={styles['meta']}>{title}</div>
      <div className={styles['sub']}>{subtitle}</div>
      <div className={styles['stars']}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < stars ? '★' : '☆'}</span>
        ))}
      </div>
    </div>
  )
}

export function Friend({ name, isOnline }) {
  return (
    <>
      <div className={styles['friend']}>
        <div className={styles['pfp']}>{name[0].toUpperCase()}</div>
        <div>{name}</div>
        <div className={[styles['status'], isOnline ? styles['online'] : styles['offline']].join(' ')}>{ isOnline ? 'Online' : 'Offline'}</div>
      </div>
    </>
  )
}

export function LeaderBoardCard({ friend, song, score }) {
  return (
    <div className={[styles['lb'], styles['card']].join(' ')}>
      <strong>{friend}</strong> —
      <span className={styles['tiny']}>{song}</span>
      <div style={{ "marginTop": "8px" }}>
        Score: <strong>{score}</strong>
      </div>
    </div>
  )
}
