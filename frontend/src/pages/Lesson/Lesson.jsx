import { useState, useRef, useEffect } from 'react'

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

const BEATS_PER_MINUTE = 130;
const SECS_PER_BEAT = 1 / (BEATS_PER_MINUTE / 60)

// Happy Birthday in C — beat is in quarter notes
const beat = SECS_PER_BEAT * 1000
const songChart = [
  // "Happy birthday to you"
  { time: 0 * beat,     string: 'B', fret: 1 },   // C
  { time: 0.5 * beat,   string: 'B', fret: 1 },   // C
  { time: 1 * beat,     string: 'B', fret: 3 },   // D
  { time: 2 * beat,     string: 'B', fret: 1 },   // C
  { time: 3 * beat,     string: 'E_HIGH', fret: 1 }, // F
  { time: 4 * beat,     string: 'B', fret: 5 },   // E (B string fret 5)

  // "Happy birthday to you"
  { time: 6 * beat,     string: 'B', fret: 1 },   // C
  { time: 6.5 * beat,   string: 'B', fret: 1 },   // C
  { time: 7 * beat,     string: 'B', fret: 3 },   // D
  { time: 8 * beat,     string: 'B', fret: 1 },   // C
  { time: 9 * beat,     string: 'E_HIGH', fret: 3 }, // G
  { time: 10 * beat,    string: 'E_HIGH', fret: 1 }, // F

  // "Happy birthday dear [name]"
  { time: 12 * beat,    string: 'B', fret: 1 },   // C
  { time: 12.5 * beat,  string: 'B', fret: 1 },   // C
  { time: 13 * beat,    string: 'E_HIGH', fret: 5 }, // high C (E string fret 5 = A... close enough)
  { time: 14 * beat,    string: 'E_HIGH', fret: 2 }, // A (E string fret 2... approximation)
  { time: 15 * beat,    string: 'E_HIGH', fret: 1 }, // F
  { time: 16 * beat,    string: 'B', fret: 5 },   // E
  { time: 17 * beat,    string: 'B', fret: 3 },   // D

  // "Happy birthday to you"
  { time: 18 * beat,    string: 'G', fret: 3 },   // Bb (approx)
  { time: 18.5 * beat,  string: 'G', fret: 3 },   // Bb
  { time: 19 * beat,    string: 'E_HIGH', fret: 2 }, // A
  { time: 20 * beat,    string: 'E_HIGH', fret: 1 }, // F
  { time: 21 * beat,    string: 'E_HIGH', fret: 3 }, // G
  { time: 22 * beat,    string: 'E_HIGH', fret: 1 }, // F
]

const SCROLL_TIME = 1500 // ms for note to travel top to bottom
const START_DELAY = 5000 // ms before song starts

export default function Lesson() {
  const [notes, setNotes] = useState([])
  const requestRef = useRef()
  const startTimeRef = useRef(null)
  const nextNoteIdx = useRef(0)

  useEffect(() => {
    function loop(time) {
      if (!startTimeRef.current) startTimeRef.current = time
      const elapsed = time - startTimeRef.current - START_DELAY

      // Spawn notes from the chart when it's time
      while (
        nextNoteIdx.current < songChart.length &&
        elapsed >= songChart[nextNoteIdx.current].time
      ) {
        const chartNote = songChart[nextNoteIdx.current]
        setNotes(prev => [...prev, {
          id: nextNoteIdx.current,
          string: chartNote.string,
          fret: chartNote.fret,
          glow: false,
          spawnTime: chartNote.time,
        }])
        nextNoteIdx.current++
      }

      // Update progress for all notes
      setNotes(prev => prev
        .map(note => ({
          ...note,
          progress: (elapsed - note.spawnTime) / SCROLL_TIME
        }))
        .filter(note => note.progress <= 1.0)
      )

      requestRef.current = requestAnimationFrame(loop)
    }

    requestRef.current = requestAnimationFrame(loop)
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