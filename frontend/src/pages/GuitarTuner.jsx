import { useState, useEffect, useRef } from 'react'
import { useMicPitch, findNearestNote } from '../hooks/useMicPitch'

import styles from './GuitarTuner.module.css'
import HomeButton from '../components/HomeButton'


const meterImages = import.meta.glob('../assets/Tuner/Sound Meter/*.png', { eager: true, import: 'default' })
const noteAudio = import.meta.glob('../assets/Tuner/Notes/*.flac', { eager: true, import: 'default' })

export default function GuitarTuner() {
  let [activeNote, setActiveNote] = useState("string-a");
  const { listening, pitch, toggle } = useMicPitch();
  const lastNoteRef = useRef(0)
  const lastDisplayNoteRef = useRef(0)
  const [displayNote, setDisplayNote] = useState(null)

  useEffect(() => { toggle() }, [])

  useEffect(() => {
    if (!listening || !pitch?.note) return
    const now = Date.now()
    if (now - lastNoteRef.current >= 250) {
      setActiveNote(pitch.note)
      lastNoteRef.current = now
    }
  }, [listening, pitch?.note])

  useEffect(() => {
    const now = Date.now()
    if (now - lastDisplayNoteRef.current >= 300) {
      setDisplayNote(pitch?.nearestNote ?? null)
      lastDisplayNoteRef.current = now
    }
  }, [pitch?.nearestNote?.note, pitch?.nearestNote?.octave])

  const stringLetters = [
    "e-low",
    "a",
    "d",
    "g",
    "b",
    "e-high",
  ]
  
  function handleNoteSelect({ note }) {
    setActiveNote(note);
    const file_name = note.replace('-', '_') + ".flac";
    const audio = new Audio(noteAudio[`../assets/Tuner/Notes/${file_name}`]);
    audio.play();
  }
  
  return (
    <div className={styles['tuner-container']}>
      <HomeButton />
      <SoundMeter activeNote={activeNote} pitch={pitch} listening={listening} onToggle={toggle} />
        <div className={styles['guitar-container']}>
          <div className={styles['guitar-headstock']}>
            <div className={styles['headstock-image']}></div>
            <div className={styles['guitar-strings']}>
              {stringLetters.map((note, idx) => (
                <GuitarString note={note} activeNote={activeNote} key={idx} />
               ))}
            </div>
            <div className={styles['string-letters']}>
              {stringLetters.map((note, idx) => (
                <StringLetter note={note}
                  activeNote={activeNote}
                  key={idx}
                  handleClick={() => handleNoteSelect({ note })}
                />
               ))}
            </div>
          </div>
        </div>
      {displayNote && (
        <div className={styles['current-note-display']}>
          {displayNote.note}{displayNote.octave}
        </div>
      )}
    </div>
  )
}

export function GuitarString({ note, activeNote }) {
  return (
    <div className={[styles['guitar-string'], styles[`string-${note}`], note == activeNote ? styles['active'] : ''].filter(Boolean).join(' ')} id={note}></div>
  )
}

export function StringLetter({ note, activeNote, handleClick }) {
  return (
    <div
      className={[styles['string-letter'], styles[`letter-${note}`], note == activeNote ? styles['active'] : ''].filter(Boolean).join(' ')}
      id={note}
      onClick={handleClick}
    >
      {note[0].toUpperCase()}
    </div>
  )
}

const SM = '../assets/Tuner/Sound Meter/'

const meters = {
  'e-low':  { meter: meterImages[`${SM}E Left Meter.png`],  arrow: meterImages[`${SM}E Left Arrow.png`],  checked: meterImages[`${SM}E Left Checked Arrow.png`],  color: '#ff3399' },
  'a':      { meter: meterImages[`${SM}A Meter.png`],       arrow: meterImages[`${SM}A Arrow.png`],       checked: meterImages[`${SM}A Checked Arrow.png`],       color: '#6677ee' },
  'd':      { meter: meterImages[`${SM}D Meter.png`],       arrow: meterImages[`${SM}D Arrow.png`],       checked: meterImages[`${SM}D Checked Arrow.png`],       color: '#e8724a' },
  'g':      { meter: meterImages[`${SM}G Meter.png`],       arrow: meterImages[`${SM}G Arrow.png`],       checked: meterImages[`${SM}G Checked Arrow.png`],       color: '#5bc8e8' },
  'b':      { meter: meterImages[`${SM}B Meter.png`],       arrow: meterImages[`${SM}B Arrow.png`],       checked: meterImages[`${SM}B Checked Arrow.png`],       color: '#cc00ff' },
  'e-high': { meter: meterImages[`${SM}E Right Meter.png`], arrow: meterImages[`${SM}E Right Arrow.png`], checked: meterImages[`${SM}E Right Checked Arrow.png`], color: '#55bb55' },
}

export function SoundMeter({ activeNote, pitch, listening, onToggle }) {
  const [labelCents, setLabelCents] = useState(null)
  const [inTune, setInTune] = useState(false)
  const lastLabelRef = useRef(0)
  const lastInTuneRef = useRef(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastLabelRef.current >= 200) {
      setLabelCents(pitch ? pitch.cents : null)
      lastLabelRef.current = now
    }
    if (now - lastInTuneRef.current >= 250) {
      setInTune(!!(pitch && Math.abs(pitch.cents) <= 5))
      lastInTuneRef.current = now
    }
  }, [pitch])

  const images = meters[activeNote]
  if (!images) return null

  const rotation = (pitch && !inTune) ? Math.max(-90, Math.min(90, pitch.cents * 1.5)) : 0
  const arrowSrc = inTune ? images.checked : images.arrow

  const labelInTune = labelCents !== null && Math.abs(labelCents) <= 5

  return (
    <div className={styles['sound-meter']}>
      <div className={[styles['string-meter'], styles[`meter-${activeNote}`], styles['active']].filter(Boolean).join(' ')} id={`meter-${activeNote}`}>
        <img className={styles['meter-image']} src={images.meter} alt={`${activeNote} Meter`} />
        <img
          className={styles['meter-arrow']}
          src={arrowSrc}
          alt={`${activeNote} Arrow`}
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
      </div>
      {labelCents !== null && (
        <div className={styles['cents-label']} style={{ color: images.color }}>
          {labelInTune ? 'In tune' : `${labelCents > 0 ? '+' : ''}${labelCents}¢`}
        </div>
      )}
    </div>
  )
}
