import { useState } from 'react'

import './GuitarTuner.css'

export default function GuitarTuner() {
  let [activeNote, setActiveNote] = useState("string-a");
  const stringLetters = [
    "e-low",
    "a",
    "d",
    "g",
    "b",
    "e-high",
  ]
  
  return (
    <div className="guitar-container">
      <div className="guitar-headstock">
        <div className="headstock-image"></div>
        <div className="guitar-strings">
          {stringLetters.map((letter, idx) => ( 
            <GuitarString note={letter} activeNote={activeNote} key={idx} />
           ))}
        </div>
        <div className="string-letters">
          {stringLetters.map((letter, idx) => ( 
            <StringLetter note={letter} activeNote={activeNote} key={idx} />
           ))}
        </div>
      </div>
    </div>
  )
}

export function GuitarString({ note, activeNote }) {
  return (
    <div className={`guitar-string string-${note} ${note == activeNote ? 'active' : ''}`} id={note}></div>
  )
}

export function StringLetter({ note, activeNote }) {
  return (
    <div className={`string-letter letter-${note} ${note == activeNote ? 'active' : ''}`} id={note}>{note[0].toUpperCase()}</div>
  )
}

