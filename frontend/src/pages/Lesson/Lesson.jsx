import { useState, useRef, useEffect } from 'react'
import songData from '../../assets/test_song.json'

import './Lesson.css'
import HomeButton from '../../components/HomeButton'
import Strings from '../../assets/Lesson Page Assets/Strings.png'
import NeonFrame from '../../assets/Lesson Page Assets/Neon Board Frame.png'
import Board from '../../assets/Lesson Page Assets/Board.png'
import StringNames from '../../assets/Lesson Page Assets/String Names.png'

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

export default function Lesson() {
  const [notes, setNotes] = useState([])
  const requestRef = useRef()
  
  const pausedTime = useRef(0)
  const pausedAt = useRef(null)
  const startTimeRef = useRef(null)
  const nextNoteIdx = useRef(0)
  
  const loopRef = useRef()
  const isPaused = useRef(false)

  function pause() {
    pausedAt.current = performance.now()
    cancelAnimationFrame(requestRef.current)
    isPaused.current = true
  }

  function unpause() {
    requestRef.current = requestAnimationFrame(loopRef.current)
    isPaused.current = false
  }

  // toggle pause with a for now
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'a') {
        isPaused.current ? unpause() : pause()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    function loop(time) {
      if (!startTimeRef.current) startTimeRef.current = time
      if (pausedAt.current != null) {
        pausedTime.current += time - pausedAt.current;
        pausedAt.current = null;
      }
      
      const elapsed = time - startTimeRef.current - pausedTime.current;

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

      // Single update: spawn + progress + filter
      setNotes(prev => [...prev, ...toSpawn]
        .map(note => ({
          ...note,
          progress: (elapsed - note.spawnTime) / SCROLL_TIME
        }))
        .filter(note => note.progress <= 1.0)
      )

      requestRef.current = requestAnimationFrame(loop)
    }

    requestRef.current = requestAnimationFrame(loop)
    loopRef.current = loop
    
    return () => cancelAnimationFrame(requestRef.current)
  }, [])

  return (
    <>
      <HomeButton />
      
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
            glow={note.glow}
            progress={note.progress}
          />
        ))}
      </div>
    </>
  )
}

/*
progress: decimal from 0 - 1 
string: string path note takes ['E', 'A', 'D', 'G', 'B', 'E_HIGH']
fret: fret number from 1 - 5 (for now)
glowing: use glowing or non glowing image
*/
export function Note({ progress, string, fret, glow }) {
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
  
  const noteImgPath = `../../assets/Lesson Page Assets/Notes/${string_filename}/${fret}${glow ? " Glow" : ""}.png`;
  return (
    <img src={noteImages[noteImgPath]} className={`note ${glow ? "glow" : ""}`}
      style={{
        position: 'absolute',
        left: `${currX}vh`,
        top: `${currY}vh`
      }}
    ></img>
  )
}