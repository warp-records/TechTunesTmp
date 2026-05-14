
import { useState, useEffect, useContext, useRef } from 'react'
import { Route, Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

import Avatar from "../components/Avatar"
import Points from "../components/Points"
import { resolveBodyBg } from "../components/avatarData"
import { PiCoatHanger } from 'react-icons/pi'
import HomeButton from '../components/HomeButton'
import { LuUserPlus, LuDownload, LuBook, LuShield, LuLogOut, LuCheck } from 'react-icons/lu'
import styles from './Userpage.module.css'
import PremiumBadge from '../components/PremiumBadge'
import NotificationBell from '../components/NotificationBell'
import TutorialPopup, { ArrowIndicator } from '../components/TutorialPopup'
import { useTutorial } from '../components/tutorial'

const TUTORIAL_MESSAGES = [
  "Go to the homepage",
]

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
  let [isPremium, setIsPremium] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsGained] = useState(() => Number(localStorage.getItem('pointsGained')) || undefined)
  useEffect(() => { localStorage.removeItem('pointsGained') }, [])
  const [guitarBeginnerTile, setGuitarBeginnerTile] = useState(0)
  const [lessonProgress, setLessonProgress] = useState({})
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [notifications, setNotifications] = useState([
    { title: "Donation", subtext: "$5 was just donated to your select charity, Generation Music!" },
    { title: "New song unlocked", subtext: "Sweet Child O' Mine is now available." },
    { title: "Friend request", subtext: "Alexa wants to connect." },
    { title: "Streak reminder", subtext: "Keep your 7-day streak going!" },
  ])
  
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
  const [downloaded, setDownloaded] = useState(false);
  const navigate = useNavigate();
  const homeBtnRef = useRef(null)
  const { tutorialIndex, showTutorial, start: startTutorial, close, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES, 1)
  const { fetchUser, user: authUser } = useContext(AuthContext);

  async function downloadMyData() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/download_user_data', { headers: { Authorization: 'Bearer ' + token } })
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user_${data.account.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  async function logout() {
    localStorage.clear();
    await fetchUser();
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

    async function checkPremium() {
      const res = await fetch("/api/check-premium", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      })
      if (res.ok) {
        const data = await res.json();
        setIsPremium(data.is_premium)
      }
    }

    async function getScore() {
      const res = await fetch('/api/get_score', {
        headers: { Authorization: 'Bearer ' + token }
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.score)
      }
    }

    async function getProgress() {
      const res = await fetch('/api/get_progress', { headers: { Authorization: 'Bearer ' + token } })
      if (res.ok) {
        const data = await res.json()
        const row = data.progress.find(r => r.instrument === 'guitar' && r.level === 'beginner')
        if (row) setGuitarBeginnerTile(row.unlocked_tile - 1)
      }
    }

    getAvatar();
    checkPremium();
    getScore();
    getProgress();

    setUsername(localStorage.getItem("username"));
  }, []);
  
  return (
  <div className={styles['userpage-root']}>
    <header className={styles['page-header']}>
        <nav className={[styles['nav'], styles['container']].join(' ')} aria-label="Top Navigation">
          <div className={styles['nav-left']}>
            <div ref={homeBtnRef} onClick={() => showTutorial && close()}>
              <HomeButton style={{ position: 'static' }} />
            </div>
          </div>
          <div className={styles['logo']}>🎧 TuneVerse 🎶</div>
          <div className={styles['nav-right']}>
            <NotificationBell
              notifications={notifications}
              onClearAll={() => setNotifications([])}
              open={selectedMenu === 'notifications'}
              onToggle={() => setSelectedMenu(prev => prev === 'notifications' ? null : 'notifications')}
            />
            <div className={styles['settings']}>
              <div className={styles['chip']} role="button" aria-haspopup="menu" onClick={() => setSelectedMenu(prev => prev === 'settings' ? null : 'settings')}>☰ Settings ▾</div>
              <div className={[styles['menu'], selectedMenu === 'settings' ? styles['menu-open'] : ''].filter(Boolean).join(' ')} role="menu">
                <a role="menuitem">
                  <span>Add Friends</span>
                  <LuUserPlus />
                </a>
                {/* <a role="menuitem">Privacy Settings</a> */}
                <a role="menuitem" onClick={downloadMyData}>
                  <span>Download Data</span>
                  {downloaded ? <LuCheck /> : <LuDownload />}
                </a>
                {/* <a role="menuitem">Add Spotify</a> */}
                {/* <a role="menuitem">Add Apple Music</a> */}
                <a role="menuitem">
                  <span>SongBook</span>
                  <LuBook />
                </a>
                {authUser?.admin && (
                  <Link to="/admin" style={{ color: "#66aaff" }}>
                    <span>Admin</span>
                    <LuShield />
                  </Link>
                )}
                <a role="menuitem" className={styles['logout']} onClick={logout}>
                  <span>Log out</span>
                  <LuLogOut />
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>
      {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
      {showTutorial && (() => {
        const rect = homeBtnRef.current?.getBoundingClientRect()
        return rect ? <ArrowIndicator x={rect.left + rect.width / 2} y={rect.bottom} direction="up" /> : null
      })()}

    <main className={styles['container']}>
    <section id="avatar" aria-labelledby="avatar-title">
        <div className={styles['avatar-welcome']}>
          <h2 id="avatar-title" className={styles['avatar-welcome-title']}>Welcome to TuneVerse</h2>
          <div className={[styles['pickbot-speech-bubble'], isPremium ? styles['pickbot-speech-bubble-premium'] : ''].join(' ')}>
            <span>Hello, <span id="username-display">{username}</span>!</span>
            {isPremium && <PremiumBadge />}
          </div>
                
              <AvatarFrame>
                {avatarData && <Avatar form={avatarData["form"]} activeItems={avatarData["activeItems"]} bodyTexture={resolveBodyBg(avatarData["bodyBg"])} />}
              </AvatarFrame>
              <Points points={score} animateFrom={pointsGained != null ? score - pointsGained : undefined} />
        </div>
      </section>
        
    <section id="lessons" aria-labelledby="lessons-title">
      <h3 className={styles['section-title']}>Lesson Island</h3>
      <div className={styles['lessons-grid']}>
        <LessonCard
        instrument={"Guitar"}
        emoji={"🎸"}
        completed={guitarBeginnerTile}
        total={25}
        />
        
        {/* <LessonCard 
        instrument={"Piano"}
        emoji={"🎹"}
        completed={2}
        total={25}
        />*/}
        
        {/* <LessonCard 
        instrument={"Drums"}
        emoji={"🥁"}
        completed={15}
        total={25}
        />*/}
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

export function AvatarFrame({ children }) {
  return (
    <div className={styles['avatar-frame']}>
      <div className={styles['avatar-frame-inner']}>
        {children}
      </div>
      <Link to="/pickbot_edit" className={styles['avatar-hanger-btn']} title="Customize avatar">
        <PiCoatHanger />
      </Link>
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
      <div style={{ marginTop: '16px' }}><Link to="/lesson-islands/guitar/beginner" className={styles['chip']}>Continue {instrument}</Link></div>
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
