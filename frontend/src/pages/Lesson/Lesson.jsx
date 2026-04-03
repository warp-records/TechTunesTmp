import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import drumrollSrc from '../../assets/sounds/drumroll.mp3'
import applauseSrc from '../../assets/sounds/applause.mp3'

import styles from './Lesson.module.css'
import HomeButton from '../../components/HomeButton'
import TutorialPopup from '../../components/TutorialPopup'
import { useTutorial } from '../../components/tutorial'

const TUTORIAL_MESSAGES = [
  "Play notes as they appear on the screen",
  "You can see your points here",
  "Pause the lesson at any time",
]
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

// fuck man life hits so fast
const SCROLL_TIME = 1500 // ms for note to travel top to bottom
const START_DELAY = 3000
const MISS_DURATION = 500 // ms to display note after it reaches the bottom
const PLAY_WINDOW = 100  // ms before/after bottom that counts as a hit
const HIT_DURATION = 300 // ms to display glowing note after a hit

export default function Lesson() {
  const [searchParams] = useSearchParams()
  const { showTutorial, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES)
  const [songName, setSongName] = useState('')
  const [levelNum, setLevelNum] = useState(1)
  const [ready, setReady] = useState(false)
  const songChartRef = useRef([])

  useEffect(() => {
    const params = new URLSearchParams({
      tile_number: searchParams.get('tile_number'),
      instrument: searchParams.get('instrument'),
      level: searchParams.get('level'),
    })
    fetch(`/api/lesson_tile?${params}`)
      .then(r => r.json())
      .then(data => {
        const beat = (60 / data.data.bpm) * 1000
        songChartRef.current = data.data.notes.map(n => ({
          time: n.beat_time * beat,
          string: n.string,
          fret: n.fret,
        }))
        setSongName(data.name)
        setReady(true)
      })
  }, [])
  // as a decimal
  const [progress, setProgress] = useState(0.0)
  
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [fadeStrings, setFadeStrings] = useState(false)
  const [fadeFrets, setFadeFrets] = useState(false)
  const [fadeBoard, setFadeBoard] = useState(false)
  const [fadeHUD, setFadeHUD] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [showFinalScore, setShowFinalScore] = useState(false)
  const [showBackToHome, setShowBackToHome] = useState(false)
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
  
  // used to calculate elapsed game time
  const pausedTime = useRef(0)
  // last paued time
  const pausedAt = useRef(null)
  // time when the game started
  const startTimeRef = useRef(null)
  const nextNoteIdx = useRef(0)
  
  const loopRef = useRef()
  const elapsedRef = useRef(0)
  // may be redundant since pausedAt exists
  const [isPaused, setIsPaused] = useState(false)
  const [countdown, setCountdown] = useState(3)

  function pause() {
    pausedAt.current = performance.now()
    cancelAnimationFrame(requestRef.current)
    setIsPaused(true)
  }

  function unpause() {
    requestRef.current = requestAnimationFrame(loopRef.current)
    setIsPaused(false)
  }

  // used for the countdown at the beginning
  const lastCountdown = useRef(3)

  useEffect(() => {
    if (!ready || showTutorial) return
    // main game loop
    function loop(time) {
      if (!startTimeRef.current) startTimeRef.current = time
      if (pausedAt.current != null) {
        pausedTime.current += time - pausedAt.current;
        pausedAt.current = null;
      }

      const rawElapsed = time - startTimeRef.current - pausedTime.current
      const newCountdown = rawElapsed < 1000 ? 3 : rawElapsed < 2000 ? 2 : rawElapsed < START_DELAY ? 1 : null
      if (newCountdown !== lastCountdown.current) {
        lastCountdown.current = newCountdown
        setCountdown(newCountdown)
      }

      const elapsed = rawElapsed - START_DELAY;
      elapsedRef.current = elapsed

      const chart = songChartRef.current
      // Collect all notes to spawn this frame
      const toSpawn = []
      while (
        nextNoteIdx.current < chart.length &&
        elapsed >= chart[nextNoteIdx.current].time
      ) {
        const chartNote = chart[nextNoteIdx.current]
        toSpawn.push({
          id: nextNoteIdx.current,
          string: chartNote.string,
          fret: chartNote.fret,
          glow: false,
          spawnTime: chartNote.time,
        })
        nextNoteIdx.current++
      }
      if (toSpawn.length > 0) {
        setProgress(nextNoteIdx.current / chart.length)
      }

      // Single update: spawn + progress + filter
      setNotes(prev => [...prev, ...toSpawn]
        .map(note => {
          if (note.miss || note.hit) return note
          const progress = (elapsed - note.spawnTime) / SCROLL_TIME
          const noteTime = note.spawnTime + SCROLL_TIME
          if (elapsed > noteTime + PLAY_WINDOW) return { ...note, progress: 1.0, miss: true, missAt: elapsed }
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
  }, [ready, showTutorial])

  // should prolly remove this
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code !== 'Space') return
      const elapsed = elapsedRef.current
      setNotes(prev => {
        let bestNote = null
        let bestDist = Infinity
        for (const note of prev) {
          if (note.hit || note.miss) continue
          const noteTime = note.spawnTime + SCROLL_TIME
          const dist = Math.abs(elapsed - noteTime)
          if (dist <= PLAY_WINDOW && dist < bestDist) {
            bestNote = note
            bestDist = dist
          }
        }
        if (!bestNote) return prev
        setScore(s => s + 5)
        showArrow()
        return prev.map(n => n.id === bestNote.id
          ? { ...n, glow: true, hit: true, hitAt: elapsed }
          : n
        )
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // check if gameover
  useEffect(() => {
    if (
      songChartRef.current.length > 0 &&
      nextNoteIdx.current >= songChartRef.current.length &&
      notes.length === 0 &&
      elapsedRef.current > 0
    ) {
      setGameOver(true)
    }
  }, [notes])

  useEffect(() => {
    if (!gameOver) return
    setFadeStrings(true)
    setTimeout(() => setFadeFrets(true), 1000)
    setTimeout(() => setFadeBoard(true), 1500)
    setTimeout(() => setFadeHUD(true), 2000)
    setTimeout(() => setShowBlur(true), 2250)
    setTimeout(() => {
      const drumroll = new Audio(drumrollSrc)
      drumroll.play()
      setTimeout(() => new Audio(applauseSrc).play(), 2000)
      setTimeout(() => {
      setShowFinalScore(true)
      setTimeout(() => {
        const fire = (origin, angle) => confetti({
          particleCount: 80,
          angle,
          spread: 100,
          origin,
          colors: ['#9300fc', '#ff00cc', '#ffffff', '#00eaff'],
          zIndex: 25,
        })
        fire({ x: 0, y: 0.6 }, 60)
        fire({ x: 1, y: 0.6 }, 120)
        setTimeout(() => setShowBackToHome(true), 500)
      }, 1100)
      }, 2000)
    }, 2250 + 1300)
  }, [gameOver])

  return (
    <div className="lesson-active">
      {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
      <ScreenBlur show={showBlur} />
      {isPaused && <PauseMenu show={isPaused} progress={progress} levelNum={levelNum} />}
      <CountDown num={countdown} />
      <SongTitleBanner title={songName.toUpperCase()} gameOver={showBlur} />
      <PickbotButton gameOver={showBlur} />
      <PauseButton
        isPaused={isPaused}
        fadeHUD={fadeHUD}
        handleClick={() => {
          if (!gameOver) {
            isPaused ? unpause() : pause()
          }
        }}
      />
      <Score score={score} fadeHUD={fadeHUD} />
      <FinalScore score={score} show={showFinalScore} />
      
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

export function SongTitleBanner({ title, gameOver }) {
  return (
    <div className={[styles['song-title'], gameOver ? styles['game-over'] : ''].filter(Boolean).join(' ')}>
      <img src={SongTitle} className={styles['song-title-img']} />
      <span className={styles['song-title-text']}>{title}</span>
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