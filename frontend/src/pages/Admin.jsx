import { useState } from 'react'
import styles from './Admin.module.css'
import PremiumBadge from '../components/PremiumBadge'

export default function Admin() {
  const username = localStorage.getItem("username");
  const [showModPanel, setShowModPanel] = useState(false);

  return (
    <div className={styles['admin-root']}>
      <div className={styles['dashboard']}>
        <h1 className={styles['welcome']}>Welcome, {username}</h1>
        <div className={styles['grid']}>
          <DashCard
            title="Add Song"
            description="Upload a new song to the library"
            icon="🎵"
            action="Add Song"
          />
          <DashCard
            title="Add Lesson"
            description="Create a new lesson for students"
            icon="📖"
            action="Add Lesson"
          />
          <DashCard
            title="Moderation"
            description="Manage user accounts"
            icon="🛡️"
            action="Moderate"
            mod
            onClick={() => setShowModPanel(true)}
          />
        </div>
      </div>

      {showModPanel && <ModPanel onClose={() => setShowModPanel(false)} />}
    </div>
  )
}

function DashCard({ title, description, icon, action, mod, onClick }) {
  return (
    <div className={[styles['card'], mod ? styles['card-mod'] : ''].filter(Boolean).join(' ')}>
      <div className={styles['card-icon']}>{icon}</div>
      <h2 className={styles['card-title']}>{title}</h2>
      <p className={styles['card-desc']}>{description}</p>
      <button onClick={onClick} className={[styles['card-btn'], mod ? styles['btn-mod'] : styles['btn-default']].filter(Boolean).join(' ')}>
        {action}
      </button>
    </div>
  )
}

const PLACEHOLDER_USERS = [
  { id: 1, username: "RhythmQuest", premium: true },
  { id: 2, username: "MelodyMaster", premium: false },
  { id: 3, username: "BeatBuilder", premium: true },
  { id: 4, username: "ChordChampion", premium: false },
  { id: 5, username: "NoteNinja", premium: false },
  { id: 6, username: "TempoTrainer", premium: true },
  { id: 7, username: "PitchPilot", premium: false },
  { id: 8, username: "SonicScholar", premium: false },
  { id: 9, username: "BassBoss", premium: true },
  { id: 10, username: "KeyKingdom", premium: false },
  { id: 11, username: "TrebleTrek", premium: true },
  { id: 12, username: "ScaleSprint", premium: false },
  { id: 13, username: "HarmonyHero", premium: true },
  { id: 14, username: "IntervalIsland", premium: false },
  { id: 15, username: "RhythmRanger", premium: false },
  { id: 16, username: "MelodyMaze", premium: true },
  { id: 17, username: "ChordCrafter", premium: false },
  { id: 18, username: "BeatBlitz", premium: false },
  { id: 19, username: "PitchPioneer", premium: true },
  { id: 20, username: "SonicSprint", premium: false },
  { id: 21, username: "GuitarHero99", premium: true },
  { id: 22, username: "PickBotFan", premium: false },
  { id: 23, username: "RockStar42", premium: false },
  { id: 24, username: "JazzCat", premium: true },
  { id: 25, username: "DrummerBoy", premium: false },
  { id: 26, username: "BassBrigade", premium: true },
  { id: 27, username: "FretboardKing", premium: false },
  { id: 28, username: "VibratoVictor", premium: false },
  { id: 29, username: "ArpeggioAce", premium: true },
  { id: 30, username: "CrescendoCarl", premium: false },
]

function ModPanel({ onClose }) {
  const [query, setQuery] = useState("");

  const results = query
    ? PLACEHOLDER_USERS.filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className={styles['overlay']} onClick={onClose}>
      <div className={styles['mod-panel']} onClick={e => e.stopPropagation()}>
        <div className={styles['mod-header']}>
          <h2>User Search</h2>
          <button className={styles['close-btn']} onClick={onClose}>✕</button>
        </div>
        <input
          className={styles['search-input']}
          placeholder="Search by username..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <div className={styles['results']}>
          {results.length === 0
            ? <p className={styles['no-results']}>No results</p>
            : results.map(u => (
              <div key={u.id} className={styles['result-row']}>
                <div className={styles['result-name']}>
                  <span>{u.username}</span>
                  {u.premium && <PremiumBadge />}
                </div>
                <div className={styles['result-actions']}>
                  <button className={styles['btn-restrict']}>Restrict</button>
                  <button className={styles['btn-ban']}>Ban</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
