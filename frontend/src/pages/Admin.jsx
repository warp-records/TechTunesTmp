import { useState } from 'react'
import styles from './Admin.module.css'

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

function ModPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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
                <span>{u.username}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
