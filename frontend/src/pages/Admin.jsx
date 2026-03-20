import { useState, useEffect, useRef } from 'react'
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
          <AddSongCard />
          <DashCard
            title="Add Lesson"
            description="Create a new lesson for students using a song from the song database"
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

function AddSongCard() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const busy = status === 'uploading';

  function handleFile(f) {
    if (f && !busy) {
      setFile(f);
      setStatus('idle');
      setErrorMsg('');
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
    // TODO: implement upload
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
          if (!file || status === 'success') {
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
