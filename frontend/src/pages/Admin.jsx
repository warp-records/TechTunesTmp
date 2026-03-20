import { useState, useEffect, useRef } from 'react'
import styles from './Admin.module.css'
import PremiumBadge from '../components/PremiumBadge'

export default function Admin() {
  const username = localStorage.getItem("username");
  const [showModPanel, setShowModPanel] = useState(false);
  const [showLessonPanel, setShowLessonPanel] = useState(false);

  return (
    <div className={styles['admin-root']}>
      <div className={styles['dashboard']}>
        <h1 className={styles['welcome']}>Welcome, {username}</h1>
        <div className={styles['grid']}>
          <AddSongCard />
          <DashCard
            title="Assign Lesson"
            description="Create a new lesson for students using a song from the song database"
            icon="📖"
            action="Assign Lesson"
            onClick={() => setShowLessonPanel(true)}
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

      {showLessonPanel && <LessonPanel onClose={() => setShowLessonPanel(false)} />}
      {showModPanel && <ModPanel onClose={() => setShowModPanel(false)} />}
    </div>
  )
}

function AddSongCard() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [warnMsg, setWarnMsg] = useState('');
  const inputRef = useRef(null);
  const resetTimer = useRef(null);

  const busy = status === 'uploading';

  function handleFile(f) {
    if (f && !busy) {
      clearTimeout(resetTimer.current);
      setFile(f);
      setStatus('idle');
      setErrorMsg('');
      setWarnMsg('');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file || busy) return;
    setStatus('uploading');
    setErrorMsg('');
    setWarnMsg('');
    const formData = new FormData();
    formData.append('song_file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload_song', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErrorMsg(data.detail || 'Upload failed');
      } else {
        const data = await res.json();
        setStatus('success');
        if (data.skipped_notes) {
          setWarnMsg(`Some notes in this song were unplayable; ${data.skipped_notes} notes skipped`);
        }
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error');
    }
    setFile(null);
    resetTimer.current = setTimeout(() => {
      setStatus('idle');
      setErrorMsg('');
      setWarnMsg('');
    }, 5000);
  }

  const btnClass = [
    styles['card-btn'],
    status === 'success' ? styles['btn-success']
      : status === 'error' ? styles['btn-error']
      : styles['btn-default'],
  ].join(' ');

  const btnLabel = status === 'uploading' ? <span className={styles['spinner']} />
    : status === 'success' ? '✔ Uploaded'
    : status === 'error' ? '✖ Failed'
    : file ? 'Upload' : 'Choose File';

  return (
    <div
      className={[
        styles['card'], styles['song-card'],
        dragOver && !busy ? styles['song-card-over'] : '',
      ].filter(Boolean).join(' ')}
      onDragOver={e => { e.preventDefault(); if (!busy) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className={styles['card-icon']}>🎵</div>
      <h2 className={styles['card-title']}>Add Song</h2>
      <div className={styles['card-desc']}>
        <p>Upload songs to song database</p>
        <p>Must be .mxl file</p>
      </div>
      <div className={styles['drop-zone']}>
        {file
          ? <span className={styles['drop-file']}>{file.name}</span>
          : <span className={styles['drop-hint']}>Drag & drop a file here</span>
        }
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".mxl,.musicxml"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      <button
        className={btnClass}
        disabled={busy}
        onClick={() => {
          if (!file || status === 'success' || status === 'error') {
            clearTimeout(resetTimer.current);
            setStatus('idle');
            setErrorMsg('');
            setWarnMsg('');
            inputRef.current.click();
          } else {
            handleUpload();
          }
        }}
      >
        {btnLabel}
      </button>
      {status === 'error' && errorMsg && (
        <p className={styles['upload-error']}>{errorMsg}</p>
      )}
      {status === 'success' && warnMsg && (
        <p className={styles['upload-warn']}>{warnMsg}</p>
      )}
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

const SONGS = [
  { name: "Canon in D",              difficulty: "easy",   tile: 1 },
  { name: "Happy Birthday",          difficulty: "easy",   tile: 2 },
  { name: "Fur Elise",               difficulty: "medium", tile: 3 },
  { name: "Moonlight Sonata",        difficulty: "hard",   tile: 4 },
  { name: "Ode to Joy",              difficulty: "easy",   tile: 5 },
  { name: "Greensleeves",            difficulty: "medium", tile: 6 },
  { name: "Scarborough Fair",        difficulty: "medium", tile: 7 },
  { name: "House of the Rising Sun", difficulty: "expert", tile: 8 },
]

function LessonPanel({ onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const results = query
    ? SONGS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : SONGS;

  return (
    <div className={styles['overlay']} onClick={onClose}>
      <div className={styles['lesson-panel']} onClick={e => e.stopPropagation()}>
        <div className={styles['mod-header']}>
          <h2>Assign Lesson</h2>
          <button className={styles['close-btn']} onClick={onClose}>✕</button>
        </div>
        <input
          className={styles['search-input']}
          placeholder="Search by song..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <div className={styles['results']}>
          <div className={styles['song-table-header']}>
            <span>Song</span>
            <span>Difficulty</span>
            <span>Tile</span>
          </div>
          {results.length === 0
            ? <p className={styles['no-results']}>No songs found</p>
            : results.map(song => (
              <div
                key={song.name}
                className={[styles['song-row'], selected === song ? styles['result-row-selected'] : ''].filter(Boolean).join(' ')}
                onClick={() => setSelected(song)}
              >
                <span>{song.name}</span>
                <span className={styles['song-difficulty']}>{song.difficulty}</span>
                <span>{song.tile}</span>
              </div>
            ))
          }
        </div>
        <button
          className={[styles['card-btn'], styles['btn-default']].join(' ')}
          disabled={!selected}
          style={{ opacity: selected ? 1 : 0.4 }}
        >
          {selected ? `Assign lesson for "${selected.name}"` : 'Select a song'}
        </button>
      </div>
    </div>
  )
}

function ModPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [banTarget, setBanTarget] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    const token = localStorage.getItem("token");
    fetch("/api/fetch_user_list", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(data => setUsers(data));
  }

  async function handleUnban(u) {
    if (!confirm(`Unban ${u.username}?`)) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/unban?ban_user_id=${u.id}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });
    fetchUsers();
  }

  const results = query
    ? users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    : users;

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
                  <span className={u.banned && new Date() < new Date(u.banned) ? styles['banned-name'] : ''}>{u.username}</span>
                  {u.subscription_end && new Date() < new Date(u.subscription_end) && <PremiumBadge />}
                  {u.banned && new Date() < new Date(u.banned) && (
                    <span className={styles['ban-until']}>
                      {new Date(u.banned).getFullYear() === 9999
                        ? "permanently banned"
                        : `banned until ${new Date(u.banned).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
                <div className={styles['result-actions']}>
                  {u.banned && new Date() < new Date(u.banned)
                    ? <button className={styles['btn-unban']} onClick={() => handleUnban(u)}>Unban</button>
                    : <button className={styles['btn-ban']} onClick={() => setBanTarget(u)}>Ban</button>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {banTarget && (
        <BanDialog
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onBanned={() => { setBanTarget(null); fetchUsers(); }}
        />
      )}
    </div>
  )
}

function BanDialog({ user, onClose, onBanned }) {
  const [banTime, setBanTime] = useState("");
  const [banMessage, setBanMessage] = useState("");
  const [permanent, setPermanent] = useState(false);

  async function handleBan() {
    const token = localStorage.getItem("token");
    const ban_time = permanent ? "9999-12-31T23:59:59" : banTime;
    await fetch("/api/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ ban_user_id: user.id, ban_time, ban_message: banMessage || null }),
    });
    onBanned();
  }

  return (
    <div className={styles['overlay']} onClick={onClose}>
      <div className={styles['ban-dialog']} onClick={e => e.stopPropagation()}>
        <div className={styles['mod-header']}>
          <h2>Ban {user.username}</h2>
          <button className={styles['close-btn']} onClick={onClose}>✕</button>
        </div>
        <label className={styles['ban-label']}>
          <input type="checkbox" checked={permanent} onChange={e => setPermanent(e.target.checked)} />
          Permanent ban
        </label>
        {!permanent && (
          <input
            type="date"
            className={styles['search-input']}
            value={banTime}
            onChange={e => setBanTime(e.target.value)}
          />
        )}
        <input
          className={styles['search-input']}
          placeholder="Ban message (optional)"
          value={banMessage}
          onChange={e => setBanMessage(e.target.value)}
        />
        <button
          className={styles['btn-ban']}
          style={{ padding: "10px", borderRadius: "8px" }}
          onClick={handleBan}
          disabled={!permanent && !banTime}
        >
          Confirm Ban
        </button>
      </div>
    </div>
  )
}
