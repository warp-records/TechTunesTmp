import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import songData from '../../assets/test_song.json'

import './Lesson.css'
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
import Countdown1 from '../../assets/Lesson Page Assets/Countdown 1.png'
import Countdown2 from '../../assets/Lesson Page Assets/Countdown 2.png'
import Countdown3 from '../../assets/Lesson Page Assets/Countdown 3.png'
import Avatar from '../../components/Avatar'

const noteImages = import.meta.glob(
  '../../assets/Lesson Page Assets/Notes/**/*.png',
  { eager: true, import: 'default' }
)

const beat = (60 / songData.bpm) * 1000
const songChart = songData.notes.map(n => ({
  time: n.beat_time * beat,
  string: n.string,
  fret: n.fret,
}))

const SCROLL_TIME = 1500 // ms for note to travel top to bottom
const START_DELAY = 3000
const MISS_DURATION = 500 // ms to display note after it reaches the bottom
const PLAY_WINDOW = 100  // ms before/after bottom that counts as a hit
const HIT_DURATION = 300 // ms to display glowing note after a hit

export default function Lesson() {
  const [levelNum, setLevelNum] = useState(1)
  const [progress, setProgress] = useState(0.0)
  
  const [notes, setNotes] = useState([])
  const requestRef = useRef()
  
  const pausedTime = useRef(0)
  const pausedAt = useRef(null)
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

      // Collect all notes to spawn this frame
      const toSpawn = []
      while (
        nextNoteIdx.current < songChart.length &&
        elapsed >= songChart[nextNoteIdx.current].time
      ) {
        const chartNote = songChart[nextNoteIdx.current]
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
        setProgress(nextNoteIdx.current / songChart.length)
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
  }, [])

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
        return prev.map(n => n.id === bestNote.id
          ? { ...n, glow: true, hit: true, hitAt: elapsed }
          : n
        )
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <PauseMenu show={isPaused} progress={progress} levelNum={levelNum} />
      <CountDown num={countdown} />
      <SongTitleBanner title="TEST SONG" />
      <PickbotButton />
      <PauseButton
        isPaused={isPaused}
        handleClick={() => {
          isPaused ? unpause() : pause()
        }}
      />
      
      <div className="lesson-stage">
        <img className="layer-board" src={Board} alt="Board" />
        <img className="layer-frame" src={NeonFrame} alt="Neon Board Frame" />
        <img className="layer-strings" src={Strings} alt="Strings" />
        <img className="layer-string-names" src={StringNames} alt="String Names" />

        {notes.map(note => (
          <Note
            key={note.id}
            string={note.string}
            fret={note.fret}
            progress={note.progress}
            miss={note.miss}
            hit={note.hit}
          />
        ))}
      </div>
    </>
  )
}

export function PickbotButton() {
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
    <div className="pickbot-button">
      <img src={PickbotImg} className="pickbot-button-bg" />
      {avatarData && (
        <div className="pickbot-button-avatar">
          <Avatar form={avatarData.form} activeItems={avatarData.activeItems} color={avatarData.bodyColor} />
        </div>
      )}
    </div>
  )
}

export function SongTitleBanner({ title }) {
  return (
    <div className="song-title">
      <img src={SongTitle} className="song-title-img" />
      <span className="song-title-text">{title}</span>
    </div>
  )
}

const countdownImgs = { 1: Countdown1, 2: Countdown2, 3: Countdown3 }
export function CountDown({ num }) {
  if (!countdownImgs[num]) return null
  return (
    <img key={num} src={countdownImgs[num]} className="countdown-img" />
  )
}

export function PauseMenu({ show, progress, levelNum }) {
  const navigate = useNavigate()
  return (
    <>
      <div className={`pause-menu-overlay${show ? ' visible' : ''}`} />
      <div className={`pause-box-popup${show ? ' visible' : ''}`}>
        <div className="pause-box">
          <img src={PauseBoxImg} className="pause-box-img" />
          <div className="pause-box-upper">
            <p>Level {levelNum}</p>
            <p style={{fontSize: '35px'}}>{Math.round(progress * 100)}% Complete</p>
          </div>
          <div className="pause-box-lower">
            <button className="pause-menu-btn" onClick={() => navigate('/homepage')}>
              <img src={BackToHomeImg} className="back-to-home-button" />
            </button>
            <img src={BattleFriendImg} className="battle-friend-button" />
          </div>
        </div>
      </div>
    </>
  )
}

export function PauseButton({ isPaused, handleClick }) {
  const imgSrc = isPaused ? PlayImg : PauseImg;
  return (<img src={imgSrc} onClick={handleClick} className="pause-play-button" />)
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
    return <img src={noteImages[missImgPath]} className="note miss" style={pos} />
  }

  // render both images since swapping out the src makes it lag
  return (
    <>
      <img src={noteImages[normalImgPath]} className="note"
        style={{ ...pos, opacity: hit ? 0 : 1 }} />
      <img src={noteImages[glowImgPath]} className={`note glow${hit ? " hit" : ""}`}
        style={{ ...pos, opacity: hit ? 1 : 0 }} />
    </>
  )
}