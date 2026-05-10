import { useState, useEffect, useRef } from 'react'
import { MdOutlineModeEdit } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Admin.module.css'
import PremiumBadge from '../components/PremiumBadge'
import HomeButton from '../components/HomeButton';

export default function Admin() {
  const username = localStorage.getItem("username");
  const [showModPanel, setShowModPanel] = useState(false);
  const [showLessonPanel, setShowLessonPanel] = useState(false);
  const [showNonProfitPanel, setShowNonProfitPanel] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [assignToast, setAssignToast] = useState(searchParams.has('assignedSong'));

  useEffect(() => {
    if (!assignToast) return;
    setSearchParams({}, { replace: true });
    const t = setTimeout(() => setAssignToast(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles['admin-root']}>
      <HomeButton />
      {assignToast && (
        <div className={styles['assign-toast']}>
          Successfully assigned song
        </div>
      )}
      <div className={styles['dashboard']}>
        <h1 className={styles['welcome']}>Welcome, {username}</h1>
        <div className={styles['grid']}>
          <AddSongCard />
          <InviteKeyCard />
          <DashCard
            title="Song Database"
            description="Browse the song database and assign songs to lesson tiles"
            icon="📂"
            action="View Songs"
            onClick={() => setShowLessonPanel(true)}
          />
          <DashCard
            title="Moderation"
            description="Manage user accounts"
            icon="🛡️"
            action="Moderate"
            btnClass="btn-mod"
            onClick={() => setShowModPanel(true)}
          />
          <DashCard
            title="Non profits"
            description="Manage non profit organizations"
            icon="🏛️"
            action="Manage"
            btnClass="btn-green"
            onClick={() => setShowNonProfitPanel(true)}
          />
        </div>
      </div>

      {showLessonPanel && <LessonPanel onClose={() => setShowLessonPanel(false)} />}
      {showModPanel && <ModPanel onClose={() => setShowModPanel(false)} />}
      {showNonProfitPanel && <NonProfitPanel onClose={() => setShowNonProfitPanel(false)} />}
    </div>
  )
}

function AddSongCard() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [warnMsg, setWarnMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
    setSuccessMsg('');
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
        setSuccessMsg(`Added "${data.name}" to database`);
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
      setSuccessMsg('');
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
      {status === 'success' && successMsg && (
        <p className={styles['upload-success']}>{successMsg}</p>
      )}
      {status === 'success' && warnMsg && (
        <p className={styles['upload-warn']}>{warnMsg}</p>
      )}
    </div>
  )
}

function InviteKeyCard() {
  const [key, setKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/generate_invite_key', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    })
    const data = await res.json()
    setKey(data.key)
    setLoading(false)
    setCopied(false)
  }

  function copy() {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles['card']}>
      <div className={styles['card-icon']}>🔑</div>
      <h2 className={styles['card-title']}>Invite Key</h2>
      <p className={styles['card-desc']}>Generate a one-time invite key for a new user</p>
      {key && (
        <div className={styles['invite-key']} onClick={copy} title="Click to copy">
          {key}
          <span className={styles['invite-copy']}>{copied ? '✔ Copied' : 'Copy'}</span>
        </div>
      )}
      <button
        className={[styles['card-btn'], styles['btn-default']].join(' ')}
        onClick={generate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Key'}
      </button>
    </div>
  )
}

function DashCard({ title, description, icon, action, btnClass, onClick }) {
  return (
    <div className={styles['card']}>
      <div className={styles['card-icon']}>{icon}</div>
      <h2 className={styles['card-title']}>{title}</h2>
      <p className={styles['card-desc']}>{description}</p>
      <button onClick={onClick} className={[styles['card-btn'], styles[btnClass] ?? styles['btn-default']].join(' ')}>
        {action}
      </button>
    </div>
  )
}

const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard', 'Expert']

const SONGS = [
  { id: 1, name: "Canon in D",              difficulty: 0, tile: 1 },
  { id: 2, name: "Happy Birthday",          difficulty: 0, tile: 2 },
  { id: 3, name: "Fur Elise",               difficulty: 1, tile: 3 },
  { id: 4, name: "Moonlight Sonata",        difficulty: 2, tile: 4 },
  { id: 5, name: "Ode to Joy",              difficulty: 0, tile: 5 },
  { id: 6, name: "Greensleeves",            difficulty: 1, tile: 6 },
  { id: 7, name: "Scarborough Fair",        difficulty: 1, tile: 7 },
  { id: 8, name: "House of the Rising Sun", difficulty: 3, tile: 8 },
]

function LessonPanel({ onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingGenreId, setEditingGenreId] = useState(null);
  const [editingGenre, setEditingGenre] = useState('');
  const navigate = useNavigate();

  function fetchSongs() {
    const token = localStorage.getItem('token');
    fetch('/api/all_songs_meta', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        setSongs(data);
        setSelected(prev => prev ? data.find(s => s.id === prev.id) ?? null : null);
      });
  }

  useEffect(() => { fetchSongs() }, []);

  async function handleRename(song) {
    if (!editingName.trim() || editingName === song.name) { setEditingId(null); return }
    const token = localStorage.getItem('token')
    await fetch(`/api/update_song?song_id=${song.id}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName.trim() }),
    })
    setEditingId(null)
    fetchSongs()
  }

  async function handleGenreEdit(song) {
    const token = localStorage.getItem('token')
    await fetch(`/api/update_song?song_id=${song.id}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre: editingGenre.trim() || null }),
    })
    setEditingGenreId(null)
    fetchSongs()
  }

  async function handleDelete(song, e) {
    e.stopPropagation()
    if (!confirm(`Delete "${song.name}"? This will also unassign it from any tiles.`)) return
    const token = localStorage.getItem('token')
    await fetch(`/api/delete_song?song_id=${song.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    })
    if (selected?.id === song.id) setSelected(null)
    fetchSongs()
  }

  const results = query
    ? songs.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : songs;

  return (
    <div className={styles['overlay']} onClick={onClose}>
      <div className={styles['lesson-panel']} onClick={e => e.stopPropagation()}>
        <div className={styles['mod-header']}>
          <h2>Song Database</h2>
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
            <span>Instrument</span>
            <span>Difficulty</span>
            <span>Genre</span>
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
                <span className={styles['song-name-cell']}>
                  {editingId === song.id ? (
                    <input
                      className={styles['search-input']}
                      style={{ padding: '2px 6px', fontSize: '0.875rem' }}
                      value={editingName}
                      autoFocus
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleRename(song)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(song); if (e.key === 'Escape') setEditingId(null) }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span>{song.name}</span>
                      <button
                        className={styles['rename-btn']}
                        onClick={e => { e.stopPropagation(); setEditingId(song.id); setEditingName(song.name) }}
                        title="Rename"
                      ><MdOutlineModeEdit /></button>
                    </>
                  )}
                </span>
                <span>{song.instrument}</span>
                <span className={styles['song-difficulty']}>{song.difficulty != null ? DIFFICULTY_LABELS[song.difficulty] : '—'}</span>
                <span className={styles['song-name-cell']}>
                  {editingGenreId === song.id ? (
                    <input
                      className={styles['search-input']}
                      style={{ padding: '2px 6px', fontSize: '0.875rem' }}
                      value={editingGenre}
                      autoFocus
                      placeholder="Genre"
                      onChange={e => setEditingGenre(e.target.value)}
                      onBlur={() => handleGenreEdit(song)}
                      onKeyDown={e => { if (e.key === 'Enter') handleGenreEdit(song); if (e.key === 'Escape') setEditingGenreId(null) }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span>{song.genre ?? '—'}</span>
                      <button
                        className={styles['rename-btn']}
                        onClick={e => { e.stopPropagation(); setEditingGenreId(song.id); setEditingGenre(song.genre ?? '') }}
                        title="Edit genre"
                      ><MdOutlineModeEdit /></button>
                    </>
                  )}
                </span>
                <span>{song.tiles?.length > 0 ? song.tiles.map(t => `${t.level} #${t.tile_number}`).join(', ') : '—'}</span>
              </div>
            ))
          }
        </div>
        <div className={styles['song-actions']}>
          <button
            className={[styles['card-btn'], selected?.tiles?.length > 0 ? styles['btn-mod'] : styles['btn-default']].join(' ')}
            disabled={!selected}
            style={{ opacity: selected ? 1 : 0.4, flex: 1 }}
            onClick={async () => {
              if (!selected) return
              if (selected.tiles?.length > 0) {
                if (!confirm(`Unassign "${selected.name}" from all tiles?`)) return
                const token = localStorage.getItem('token')
                await fetch(`/api/unassign_song?song_id=${selected.id}`, {
                  method: 'DELETE',
                  headers: { Authorization: 'Bearer ' + token },
                })
                fetchSongs()
              } else {
                navigate(`/guitar_island?assignSongId=${selected.id}`)
              }
            }}
          >
            {!selected ? 'Select a song' : selected.tiles?.length > 0 ? `Unassign "${selected.name}"` : `Assign "${selected.name}"`}
          </button>
          <label className={styles['show-in-search-label']}>
            <input
              type="checkbox"
              checked={selected?.show_in_search ?? false}
              disabled={!selected}
              onChange={async e => {
                if (!selected) return
                const token = localStorage.getItem('token')
                await fetch(`/api/update_song?song_id=${selected.id}`, {
                  method: 'PATCH',
                  headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ show_in_search: e.target.checked }),
                })
                fetchSongs()
              }}
            />
            Show in search
          </label>
          <button
            className={styles['delete-btn']}
            disabled={!selected}
            style={{ opacity: selected ? 1 : 0.4 }}
            onClick={() => selected && handleDelete(selected, { stopPropagation: () => {} })}
            title="Delete song"
          >🗑️</button>
        </div>
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
                    : !u.admin && <button className={styles['btn-ban']} onClick={() => setBanTarget(u)}>Ban</button>
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

function NonProfitPanel({ onClose }) {
  const [nonprofits, setNonprofits] = useState([]);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    fetchNonprofits();
  }, []);

  function fetchNonprofits() {
    const token = localStorage.getItem('token');
    fetch('/api/admin/nonprofit/list', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(setNonprofits);
  }

  async function handleApprove(id) {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/nonprofit/approve?nonprofit_id=${id}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    fetchNonprofits();
  }

  async function handleReject(id) {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/nonprofit/reject?nonprofit_id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    });
    fetchNonprofits();
  }

  const filtered = nonprofits.filter(np => tab === 'pending' ? !np.is_verified : np.is_verified);

  return (
    <div className={styles['overlay']} onClick={onClose}>
      <div className={styles['nonprofit-panel']} onClick={e => e.stopPropagation()}>
        <div className={styles['mod-header']}>
          <h2>Non Profits</h2>
          <button className={styles['close-btn']} onClick={onClose}>✕</button>
        </div>
        <div className={styles['np-tabs']}>
          <button
            className={[styles['np-tab'], tab === 'pending' ? styles['np-tab-active'] : ''].join(' ')}
            onClick={() => setTab('pending')}
          >
            Pending
          </button>
          <button
            className={[styles['np-tab'], tab === 'verified' ? styles['np-tab-active'] : ''].join(' ')}
            onClick={() => setTab('verified')}
          >
            Verified
          </button>
        </div>
        <div className={styles['results']}>
          {filtered.length === 0
            ? <p className={styles['no-results']}>No {tab} organizations</p>
            : filtered.map(np => (
              <div key={np.id} className={styles['result-row']}>
                <div className={styles['result-name']}>
                  <div>
                    <div>{np.name}</div>
                    <a className={styles['np-email']} href={`mailto:${np.email}`}>{np.email}</a>
                  </div>
                </div>
                <div className={styles['result-actions']}>
                  {tab === 'pending'
                    ? <>
                        <button className={styles['btn-approve']} onClick={() => handleApprove(np.id)}>Approve</button>
                        <button className={styles['btn-ban']} onClick={() => handleReject(np.id)}>Reject</button>
                      </>
                    : <span className={styles['np-balance']}>${np.balance.toLocaleString()}</span>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
