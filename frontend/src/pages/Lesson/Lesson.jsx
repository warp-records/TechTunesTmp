import { useState, useRef, useEffect } from 'react'
import { useMicPitch, stringFretToNote } from '../../hooks/useMicPitch'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../App'
import { buildRequestToken } from '../../requestToken'
import confetti from 'canvas-confetti'
import drumrollSrc from '../../assets/sounds/drumroll.mp3'
import applauseSrc from '../../assets/sounds/applause.mp3'
import wahSrc from '../../assets/sounds/wah_wah_wah.mp3'

import styles from './Lesson.module.css'
import HomeButton from '../../components/HomeButton'
import Strings from '../../assets/Lesson Page Assets/Strings.png'
import NeonFrame from '../../assets/Lesson Page Assets/Neon Board Frame.png'
import Board from '../../assets/Lesson Page Assets/Board.png'
import StringNames from '../../assets/Lesson Page Assets/String Names.png'
import PauseImg from '../../assets/Lesson Page Assets/Pause Button.png'
import PlayImg from '../../assets/Lesson Page Assets/Play Button.png'
import SongTitle from '../../assets/Lesson Page Assets/Song Title.png'
import PickbotImg from '../../assets/Lesson Page Assets/Pickbot Button.png'
import PauseBoxImg from '../../assets/Lesson Page Assets/Pause Box.png'
import BackToHomeImg from '../../assets/Lesson Page Assets/Back to Home Button.png'
import BattleFriendImg from '../../assets/Lesson Page Assets/Battle Friend Button.png'
import UpArrow from '../../assets/Lesson Page Assets/Up Arrow.png'
import UpArrowGlow from '../../assets/Lesson Page Assets/Up Arrow Glow.png'
import DownArrow from '../../assets/Lesson Page Assets/Down Arrow.png'
import Countdown1 from '../../assets/Lesson Page Assets/Countdown 1.png'
import Countdown2 from '../../assets/Lesson Page Assets/Countdown 2.png'
import Countdown3 from '../../assets/Lesson Page Assets/Countdown 3.png'
import Avatar from '../../components/Avatar'
import { resolveBodyBg } from '../../components/avatarData'

const noteImages = import.meta.glob(
  '../../assets/Lesson Page Assets/Notes/**/*.png',
  { eager: true, import: 'default' }
)

const starImages = import.meta.glob(
  '../../assets/Lesson Page Assets/Stars/*.svg',
  { eager: true, import: 'default' }
)

// fuck man life hits so fast


// secretly send over the score to the server through /api/me

const SCROLL_TIME = 3000 // ms for note to travel top to bottom
const START_DELAY = 3000
const MISS_DURATION = 500 // ms to display note after it reaches the bottom
const PLAY_WINDOW = 300  // ms before/after bottom that counts as a hit
const HIT_DURATION = 300 // ms to display glowing note after a hit

export default function Lesson() {
  const [retryKey, setRetryKey] = useState(0)
  return <LessonGame key={retryKey} onRetry={() => setRetryKey(k => k + 1)} />
}

function LessonGame({ onRetry }) {
  const { fetchUser } = useAuth()
  // contains the tile number, instrument, and level number
  const [searchParams] = useSearchParams()
  const [songName, setSongName] = useState('')
  const [levelNum, setLevelNum] = useState(1)
  const [ready, setReady] = useState(false)
  const songChartRef = useRef([])
  function lastBeat() {
    const n = songChartRef.current.length
    if (n === 0) return 1
    const extraBeats = (SCROLL_TIME + PLAY_WINDOW) * bpmRef.current / 60000
    return songChartRef.current[n - 1].time + extraBeats
  }
  function songProgress() {
    return Math.min(Math.max(currentBeat() / lastBeat(), 0), 1)
  }

  useEffect(() => {
    const params = new URLSearchParams({
      tile_number: searchParams.get('tile_number'),
      instrument: searchParams.get('instrument'),
      level: searchParams.get('level'),
    })
    fetch(`/api/lesson_tile?${params}`)
      .then(r => r.json())
      .then(data => {
        // replace songChartRef notes mapping in the fetch:
        const baseBpm = data.data.bpm
        updateBpm(baseBpm)

        const notes = data.data.notes.map(n => ({
          time: n.beat_time,  // keep raw, don't convert yet
          string: n.string,
          fret: n.fret,
        }))

        songChartRef.current = notes
        setSongName(data.name)
        setReady(true)
      })
  }, [])
  // bpm ref used for game loop, state for display
  const bpmRef = useRef(0)
  const [bpm, setBpm] = useState(0)
  // as a decimal
  const [progress, setProgress] = useState(0.0)
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  //separate ref for key down listener
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  // history is scored in beat time (num beats into song)
  // rather than raw time
  // [{beatTime, score}]
  const scoreHistory = useRef([])
  const inputHistory = useRef([])
  
  // states for different phase of gameover screen
  const [gameOver, setGameOver] = useState(false)
  const [fadeStrings, setFadeStrings] = useState(false)
  const [fadeFrets, setFadeFrets] = useState(false)
  const [fadeBoard, setFadeBoard] = useState(false)
  const [fadeHUD, setFadeHUD] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [showFinalScore, setShowFinalScore] = useState(false)
  const [showBackToHome, setShowBackToHome] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [starRating, setStarRating] = useState(1)
  
  const confettiCanvasRef = useRef(null)
  const confettiInstance = useRef(null)

  const [reviewMode, setReviewMode] = useState(false)
  const reviewModeRef = useRef(false)
  const nextReplayIdx = useRef(0)

  // used to force a re render on the arrow which triggers animation
  const [arrowKey, setArrowKey] = useState(0)
  const [arrowVisible, setArrowVisible] = useState(false)

  function showArrow() {
    setArrowKey(k => k + 1)
    setArrowVisible(true)
  }
  const [notes, setNotes] = useState([])
  // request animation frame ref
  const requestRef = useRef()
  
  const nextNoteIdx = useRef(0)
  
  // time into the song, including the start delay
  const rawElapsedTime = useRef(0)
  // time of last frame we rendered to find time between frames
  const prevFrameTime = useRef(0)
  
  const loopRef = useRef()
  // used for UI
  const [isPaused, setIsPaused] = useState(false)
  // paused ref for game loop since state doesn't properly get
  // detected in game loop for some reason
  const wasPaused = useRef(false)
  const [countdown, setCountdown] = useState(3)
  
  // used for the countdown at the beginning
  const lastCountdown = useRef(3)
  
  // convert beats into a song to ms
  function noteTime(beatTime) {
    return beatTime * (60 / bpmRef.current) * 1000
  }

  function currentBeat() {
    return (rawElapsedTime.current - START_DELAY) * bpmRef.current / 60000
  }

  // playedNote: { note, octave } from mic, or null for spacebar (any note counts)
  // recordHistory: false when replaying
  function processInput(playedNote = null, recordHistory = true) {
    const elapsed = rawElapsedTime.current - START_DELAY
    setNotes(prev => {
      let bestNote = null
      let bestDist = Infinity
      for (const note of prev) {
        if (note.hit || note.miss) continue
        const noteBottomTime = noteTime(note.beatTime) + SCROLL_TIME
        const dist = Math.abs(elapsed - noteBottomTime)
        if (dist > PLAY_WINDOW || dist >= bestDist) continue
        if (playedNote) {
          const expected = stringFretToNote(note.string, note.fret)
          console.log(`expected: ${expected?.note}${expected?.octave}, played: ${playedNote.note}${playedNote.octave}`)
          if (!expected || expected.note !== playedNote.note || expected.octave !== playedNote.octave) continue
        }
        bestNote = note
        bestDist = dist
      }
      if (!bestNote) {
        // scoreRef.current = Math.max(0, scoreRef.current - 10)
        // setScore(scoreRef.current)
        // if (recordHistory) {
        //   scoreHistory.current.push({ time: currentBeat(), score: scoreRef.current })
        //   inputHistory.current.push({ time: currentBeat(), type: 'off-beat' })
        // }
        return prev
      }
      scoreRef.current += 10
      setScore(scoreRef.current)
      if (recordHistory) {
        scoreHistory.current.push({ time: currentBeat(), score: scoreRef.current })
        inputHistory.current.push({ time: currentBeat(), type: 'hit' })
      }
      showArrow()
      return prev.map(n => n.id === bestNote.id
        ? { ...n, glow: true, hit: true, hitAt: elapsed }
        : n
      )
    })
  }
 
  function updateBpm(bpm) {
    const beat = currentBeat()
    bpmRef.current = bpm
    setBpm(bpm)
    if (rawElapsedTime.current >= START_DELAY) {
      rawElapsedTime.current = noteTime(beat) + START_DELAY
    }
  }
  
  function pause() {
    cancelAnimationFrame(requestRef.current)
    setIsPaused(true)
    wasPaused.current = true
  }

  function unpause() {
    requestRef.current = requestAnimationFrame(loopRef.current)
    setIsPaused(false)
  }
  
  function seekTo(targetProgress) {
    const targetElapsed = noteTime(targetProgress * lastBeat())
    rawElapsedTime.current = targetElapsed + START_DELAY
  
    const chart = songChartRef.current
  
    // Find the index of the next note to spawn after seek point
    let idx = 0
    while (idx < chart.length && noteTime(chart[idx].time) <= targetElapsed) idx++
    nextNoteIdx.current = idx
  
    // Build the visible notes: notes that should currently be mid-scroll
    // i.e. spawnTime <= targetElapsed < spawnTime + SCROLL_TIME
    const visibleNotes = []
    for (let i = 0; i < chart.length; i++) {
      const chartNote = chart[i]
      const noteBottomTime = noteTime(chartNote.time) + SCROLL_TIME
      if (noteTime(chartNote.time) > targetElapsed) break // spawns in the future
      if (noteBottomTime < targetElapsed - PLAY_WINDOW) continue // already expired
      const progress = (targetElapsed - noteTime(chartNote.time)) / SCROLL_TIME
      visibleNotes.push({
        id: i,
        string: chartNote.string,
        fret: chartNote.fret,
        glow: false,
        beatTime: chartNote.time,
        progress: Math.min(progress, 1.0),
      })
    }
  
    setCountdown(null)
    setNotes(visibleNotes)
    setProgress(targetProgress)
  }


  // update score and play history when going back in song
  function updateHistory() {
    const beat = currentBeat()
    if (reviewModeRef.current) {
      // preserve recordings; re-derive score and replay cursor from them
      let restored = 0
      for (const entry of scoreHistory.current) {
        if (entry.time > beat) break
        restored = entry.score
      }
      scoreRef.current = restored
      setScore(restored)
      let idx = 0
      while (idx < inputHistory.current.length && inputHistory.current[idx].time <= beat) idx++
      nextReplayIdx.current = idx
      return
    }
    while (scoreHistory.current.length > 0 &&
      scoreHistory.current[scoreHistory.current.length - 1].time > beat) {
      scoreHistory.current.pop()
    }
    const restored = scoreHistory.current[scoreHistory.current.length - 1]?.score ?? 0
    scoreRef.current = restored
    setScore(restored)

    while (inputHistory.current.length > 0 &&
      inputHistory.current[inputHistory.current.length - 1].time > beat) {
      inputHistory.current.pop()
    }
  }
  
  // main game loop
  useEffect(() => {
    if (!ready) return
    function loop(time) {
      if (!prevFrameTime.current) prevFrameTime.current = performance.now()
      if (wasPaused.current) {
        wasPaused.current = false
      } else {
        rawElapsedTime.current += performance.now() - prevFrameTime.current;
      }
      
      prevFrameTime.current = performance.now()
      
      const newCountdown = rawElapsedTime.current < 1000 ? 3 : rawElapsedTime.current < 2000 ? 2 : rawElapsedTime.current < START_DELAY ? 1 : null
      if (newCountdown !== lastCountdown.current) {
        lastCountdown.current = newCountdown
        setCountdown(newCountdown)
      }

      const elapsed = rawElapsedTime.current - START_DELAY;
      
      const chart = songChartRef.current
      // Collect all notes to spawn this frame
      const toSpawn = []
      while (
        nextNoteIdx.current < chart.length &&
        elapsed >= noteTime(chart[nextNoteIdx.current].time)
      ) {
        const chartNote = chart[nextNoteIdx.current]
        toSpawn.push({
          id: nextNoteIdx.current,
          string: chartNote.string,
          fret: chartNote.fret,
          glow: false,
          beatTime: chartNote.time,  // store beat time, not ms
        })
        nextNoteIdx.current++
      }
      setProgress(songProgress())

      if (reviewModeRef.current) {
        const beatNow = currentBeat()
        while (
          nextReplayIdx.current < inputHistory.current.length &&
          inputHistory.current[nextReplayIdx.current].time <= beatNow
        ) {
          const entry = inputHistory.current[nextReplayIdx.current]
          if (entry.type === 'hit' || entry.type === 'off-beat') {
            processInput(null, false)
          }
          nextReplayIdx.current++
        }
      }

      // Single update: spawn + progress + filter
      setNotes(prev => [...prev, ...toSpawn]
        .map(note => {
          if (note.miss || note.hit) return note
          const spawnTime = noteTime(note.beatTime)
          const progress = (elapsed - spawnTime) / SCROLL_TIME
          const noteBottomTime = spawnTime + SCROLL_TIME
          if (elapsed > noteBottomTime + PLAY_WINDOW) {
            if (!reviewModeRef.current) {
              inputHistory.current.push({ time: currentBeat(), progress: songProgress(), type: 'miss' })
            }
            return { ...note, progress: 1.0, miss: true, missAt: elapsed }
          }
          return { ...note, progress: Math.min(progress, 1.0) }
        })
        .filter(note => {
          if (note.miss) return elapsed - note.missAt < MISS_DURATION
          if (note.hit) return elapsed - note.hitAt < HIT_DURATION
          return true
        })
      )

      requestRef.current = requestAnimationFrame(loop)
    }

    requestRef.current = requestAnimationFrame(loop)
    loopRef.current = loop

    return () => cancelAnimationFrame(requestRef.current)
  }, [ready])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code !== 'Space') return
      if (reviewModeRef.current) return
      processInput(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const onNoteRef = useRef(null)
  onNoteRef.current = (note) => {
    if (!reviewModeRef.current) processInput(note)
  }
  const { toggle: toggleMic } = useMicPitch({ onNoteRef })
  useEffect(() => { toggleMic() }, [])

  function startReview() {
    reviewModeRef.current = true
    setReviewMode(true)
    setShowBlur(false)
    setShowFinalScore(false)
    setShowBackToHome(false)
    setShowStars(false)
    setFadeStrings(false)
    setFadeFrets(false)
    setFadeBoard(false)
    setFadeHUD(false)
    setGameOver(false)
    scoreRef.current = 0
    setScore(0)
    nextReplayIdx.current = 0
    seekTo(0)
  }

  // check if gameover
  useEffect(() => {
    if (
      songChartRef.current.length > 0 &&
      nextNoteIdx.current >= songChartRef.current.length &&
      notes.length === 0 &&
      rawElapsedTime.current > 0
    ) {
      if (reviewModeRef.current) {
        pause()
      } else {
        setGameOver(true)
      }
    }
  }, [notes])

  useEffect(() => {
    if (!gameOver) return
    fetchUser(buildRequestToken(scoreRef.current))
    const token = localStorage.getItem('token')
    fetch('/api/submit_lesson_score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        tile_number: Number(searchParams.get('tile_number')),
        instrument: searchParams.get('instrument'),
        level: searchParams.get('level'),
        score: scoreRef.current,
      }),
    })
    setFadeStrings(true)
    setTimeout(() => setFadeFrets(true), 1000)
    setTimeout(() => setFadeBoard(true), 1500)
    setTimeout(() => setFadeHUD(true), 2000)
    setTimeout(() => setShowBlur(true), 2250)
    setTimeout(() => {
      const maxScore = songChartRef.current.length * 10
      const pct = maxScore > 0 ? scoreRef.current / maxScore * 100 : 0
      const stars = pct >= 90 ? 5 : pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 50 ? 2 : 1
      if (stars > 1) {
        const drumroll = new Audio(drumrollSrc)
        drumroll.play()
      }
      setTimeout(() => {
      setShowFinalScore(true)
      setTimeout(() => {
        setStarRating(stars)
        setShowStars(true)
        if (stars > 1) {
          new Audio(applauseSrc).play()
          if (!confettiInstance.current && confettiCanvasRef.current) {
            confettiInstance.current = confetti.create(confettiCanvasRef.current, { resize: true })
          }
          const fire = (origin, angle) => confettiInstance.current?.({
            particleCount: 80,
            angle,
            spread: 100,
            origin,
            colors: ['#9300fc', '#ff00cc', '#ffffff', '#00eaff'],
          })
          fire({ x: 0, y: 0.6 }, 60)
          fire({ x: 1, y: 0.6 }, 120)
        } else {
          new Audio(wahSrc).play()
        }
        setTimeout(() => setShowBackToHome(true), 500)
      }, 1100)
      }, 2000)
    }, 2250 + 1300)
  }, [gameOver])

  return (
    <div className="lesson-active">
      <canvas ref={confettiCanvasRef} className={styles['confetti-canvas']} />
      <ScreenBlur show={showBlur} />
      {isPaused && <PauseMenu show={showPauseMenu} progress={progress} levelNum={levelNum} />}
      <CountDown num={countdown} />
      <BpmControl bpm={bpm} updateBpm={updateBpm} fadeHUD={fadeHUD} />
      <SongTitleBanner title={songName.toUpperCase()} gameOver={showBlur} />
      <div className={[styles['seek-bar'], fadeHUD ? styles['fade-hud'] : ''].filter(Boolean).join(' ')}>
        <SeekBar
          progress={progress}
          onSeek={seekTo}
          pause={pause}
          unpause={unpause}
          updateHistory={updateHistory}
          disabled={gameOver && !reviewMode}
          errorMarkers={inputHistory.current
            .filter(e => e.type === 'off-beat' || e.type === 'miss')
            .map(e => e.progress)}
        />
      </div>
      <PickbotButton gameOver={showBlur} />
      <PauseButton
        isPaused={showPauseMenu}
        fadeHUD={fadeHUD}
        handleClick={() => {
          if (gameOver && !reviewMode) return
          if (showPauseMenu) {
            setShowPauseMenu(false)
            unpause()
          } else {
            setShowPauseMenu(true)
            pause()
          }
        }}
      />
      <Score score={score} fadeHUD={fadeHUD} />
      <FinalScore score={score} show={showFinalScore} />
      {showStars && <div className={styles['gameover-stars']}><LessonStars stars={starRating} /></div>}
      
      <div className={[styles['gameover-action-row'], showBackToHome ? styles['visible'] : ''].filter(Boolean).join(' ')}>
        <ReviewButton onClick={startReview} />
        <RetryButton onRetry={onRetry} />
      </div>
      {reviewMode && (
        <div className={styles['review-mode-row']}>
          <div className={styles['review-mode-indicator']}>REVIEW MODE</div>
          <RetryButton onRetry={onRetry} />
        </div>
      )}
      <BackToHomeButton show={showBackToHome} />
      <Arrow key={arrowKey} isUp isVisible={arrowVisible} />
      
      <div className={styles['lesson-stage']}>
        <img className={[styles['layer-board'], fadeBoard ? styles['fade-frets'] : ''].filter(Boolean).join(' ')} src={Board} alt="Board" />
        <img className={[styles['layer-frame'], fadeFrets ? styles['fade-frets'] : ''].filter(Boolean).join(' ')} src={NeonFrame} alt="Neon Board Frame" />
        <img className={[styles['layer-strings'], fadeStrings ? styles['fade-strings-letters'] : ''].filter(Boolean).join(' ')} src={Strings} alt="Strings" />
        <img className={[styles['layer-string-names'], fadeStrings ? styles['fade-strings-letters'] : ''].filter(Boolean).join(' ')} src={StringNames} alt="String Names" />

        {notes.map(note => (
          <Note
            key={note.id}
            string={note.string}
            fret={note.fret}
            progress={note.progress}
            miss={note.miss}
            hit={note.hit}
            fadeFrets={fadeFrets}
          />
        ))}
      </div>
    </div>
  )
}

export function PickbotButton({ gameOver }) {
  const [avatarData, setAvatarData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    async function getAvatar() {
      const res = await fetch('/api/get-avatar/', {
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      })
      if (res.ok) {
        const data = await res.json()
        setAvatarData(data.avatar)
      }
    }
    getAvatar()
  }, [])

  return (
    <div className={[styles['pickbot-button'], gameOver ? styles['game-over'] : ''].filter(Boolean).join(' ')}>
      <img src={PickbotImg} className={styles['pickbot-button-bg']} />
      {avatarData && (
        <div className={styles['pickbot-button-avatar']}>
          <Avatar form={avatarData.form} activeItems={avatarData.activeItems} bodyTexture={resolveBodyBg(avatarData.bodyBg)} />
        </div>
      )}
    </div>
  )
}

export function Arrow({ isUp, isVisible }) {
  if (isUp) {
    return (
      <div className={[styles['arrow-container'], isVisible ? styles['visible'] : ''].filter(Boolean).join(' ')}>
        <img src={UpArrowGlow} className={styles['arrow-glow']} />
        <img src={UpArrow} className={styles['arrow-inner']} />
      </div>
    )
  }
  return <img src={DownArrow} className={styles['arrow-inner']} />
}

export function ScreenBlur({ show }) {
  return <div className={[styles['screen-blur'], show ? styles['visible'] : ''].filter(Boolean).join(' ')} />
}

export function Score({ score, fadeHUD }) {
  return <div className={[styles['score'], fadeHUD ? styles['fade-hud'] : ''].filter(Boolean).join(' ')}>{score}</div>
}

export function FinalScore({ score, show }) {
  if (!show) return null
  return <div className={styles['final-score']}>{score}</div>
}

export function BackToHomeButton({ show }) {
  const navigate = useNavigate()
  return (
    <button
      className={[styles['back-to-home-gameover'], show ? styles['visible'] : ''].filter(Boolean).join(' ')}
      onClick={() => navigate('/homepage')}
    >
      <img src={BackToHomeImg} className={styles['back-to-home-button']} />
    </button>
  )
}

export function ReviewButton({ onClick }) {
  return (
    <button className={styles['review-button-gameover']} onClick={onClick}>
      REVIEW
    </button>
  )
}

export function RetryButton({ onRetry }) {
  return (
    <button className={styles['retry-button-gameover']} onClick={onRetry}>
      ↻
    </button>
  )
}

export function SongTitleBanner({ title, gameOver }) {
  return (
    <div className={[styles['song-title'], gameOver ? styles['game-over'] : ''].filter(Boolean).join(' ')}>
      <div className={styles['song-title-banner']}>
        <img src={SongTitle} className={styles['song-title-img']} />
        <span className={styles['song-title-text']}>{title}</span>
      </div>
    </div>
  )
}

export function BpmControl({ bpm, updateBpm, fadeHUD }) {
  const minBpm = 10
  
  return (
    <div className={[styles['bpm-control'], fadeHUD ? styles['fade-hud'] : ''].filter(Boolean).join(' ')}>
      <button className={styles['bpm-btn']} onClick={() => updateBpm(bpm + 10)}>▲</button>
      <span className={styles['bpm-display']}>{bpm} BPM</span>
      <button className={styles['bpm-btn']} onClick={() => updateBpm(Math.max(bpm - 10, minBpm))}>▼</button>
    </div>
  )
}

export function SeekBar({ progress, onSeek, pause, unpause, updateHistory, disabled, errorMarkers = [] }) {
  const trackRef = useRef(null)
  const trackWidth = trackRef.current?.offsetWidth ?? 0
  const dotSize = 28
  const isDragging = useRef(false)

  function getProgress(e) {
    const rect = trackRef.current.getBoundingClientRect()
    return Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
  }

  function handlePointerDown(e) {
    if (disabled) return
    isDragging.current = true
    pause()
    e.currentTarget.setPointerCapture(e.pointerId)
    onSeek(getProgress(e))
  }

  function handlePointerMove(e) {
    if (disabled) return
    if (!isDragging.current) return
    onSeek(getProgress(e))
  }

  function handlePointerUp() {
    if (disabled) return
    isDragging.current = false
    updateHistory()
    unpause()
  }

  return (
    <div
      className={styles['lesson-progress-track']}
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles['lesson-progress-fill']} style={{ width: `${progress * 100}%` }} />
      {errorMarkers.map((p, i) => (
        <div key={i} className={styles['seek-error-marker']} style={{ left: `${p * 100}%` }} />
      ))}
      <div className={styles['lesson-progress-dot']} style={{ transform: `translateX(${progress * trackWidth - dotSize / 2}px) translateY(-50%)` }} />
    </div>
  )
}

// countdown at beginning
const countdownImgs = { 1: Countdown1, 2: Countdown2, 3: Countdown3 }
export function CountDown({ num }) {
  if (!countdownImgs[num]) return null
  return (
    <img key={num} src={countdownImgs[num]} className={styles['countdown-img']} />
  )
}

export function PauseMenu({ show, progress, levelNum }) {
  const navigate = useNavigate()
  return (
    <>
      <div className={[styles['pause-menu-overlay'], show ? styles['visible'] : ''].filter(Boolean).join(' ')} />
      <div className={[styles['pause-box-popup'], show ? styles['visible'] : ''].filter(Boolean).join(' ')}>
        <div className={styles['pause-box']}>
          <img src={PauseBoxImg} className={styles['pause-box-img']} />
          <div className={styles['pause-box-upper']}>
            <p>Level {levelNum}</p>
            <p style={{fontSize: '35px'}}>{Math.round(progress * 100)}% Complete</p>
          </div>
          <div className={styles['pause-box-lower']}>
            <button className={styles['pause-menu-btn']} onClick={() => navigate('/homepage')}>
              <img src={BackToHomeImg} className={styles['back-to-home-button']} />
            </button>
            <img src={BattleFriendImg} className={styles['battle-friend-button']} />
          </div>
        </div>
      </div>
    </>
  )
}

export function PauseButton({ isPaused, fadeHUD, handleClick }) {
  const imgSrc = isPaused ? PlayImg : PauseImg;
  return (<img src={imgSrc} onClick={handleClick} className={[styles['pause-play-button'], fadeHUD ? styles['fade-hud'] : ''].filter(Boolean).join(' ')} />)
}

/*
progress: decimal from 0 - 1 
string: string path note takes ['E', 'A', 'D', 'G', 'B', 'E_HIGH']
fret: fret number from 1 - 5 (for now)
glowing: use glowing or non glowing image
*/
export function Note({ progress, string, fret, miss, hit }) {
  let string_filename = string;
  if (string == 'E_HIGH') {
    string_filename = "E2";
  }
  
  let stringIdxMap = {
    'E': 0,
    'A': 1,
    'D': 2,
    'G': 3,
    'B': 4,
    'E_HIGH': 5
  }
  let stringIdx = stringIdxMap[string];
  
  const xStart = 20 + 11.5 * stringIdx;
  const yStart = 0;
  
  // in viewports
  const xEnd = 10 + stringIdx * 16.05;
  const yEnd = 91;
  
  const currX = xStart + (xEnd - xStart) * progress
  const currY = yStart + (yEnd - yStart) * progress
  
  const missImgPath = `../../assets/Lesson Page Assets/Notes/${string_filename}/X ${string_filename}.png`;
  const normalImgPath = `../../assets/Lesson Page Assets/Notes/${string_filename}/${fret}.png`;
  const glowImgPath = `../../assets/Lesson Page Assets/Notes/${string_filename}/${fret} Glow.png`;
  const pos = { position: 'absolute', left: `${currX}vh`, top: `${currY}vh` }

  if (miss) {
    return <img src={noteImages[missImgPath]} className={[styles['note'], styles['miss']].join(' ')} style={pos} />
  }

  // render both images since swapping out the src makes it lag
  return (
    <>
      <img src={noteImages[normalImgPath]} className={styles['note']}
        style={{ ...pos, opacity: hit ? 0 : 1 }} />
      <img src={noteImages[glowImgPath]} className={[styles['note'], styles['glow'], hit ? styles['hit'] : ''].filter(Boolean).join(' ')}
        style={{ ...pos, opacity: hit ? 1 : 0 }} />
    </>
  )
}

export function LessonStars({ stars }) {
  const src = starImages[`../../assets/Lesson Page Assets/Stars/${stars}_star.svg`]
  if (!src) return null
  return <img src={src} alt={`${stars} star${stars !== 1 ? 's' : ''}`} />
}