import { useState } from 'react'

import './GuitarTuner.css'

const meterImages = import.meta.glob('../assets/Tuner/Sound Meter/*.png', { eager: true, import: 'default' })

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
    <div class="tuner-container">
      <SoundMeter activeNote={activeNote} />
        <div className="guitar-container">
          <div className="guitar-headstock">
            <div className="headstock-image"></div>
            <div className="guitar-strings">
              {stringLetters.map((note, idx) => ( 
                <GuitarString note={note} activeNote={activeNote} key={idx} />
               ))}
            </div>
            <div className="string-letters">
              {stringLetters.map((note, idx) => ( 
                <StringLetter note={note}
                  activeNote={activeNote}
                  key={idx}
                  handleClick={() => setActiveNote(note)}
                />
               ))}
            </div>
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

export function StringLetter({ note, activeNote, handleClick }) {
  return (
    <div
      className={`string-letter letter-${note} ${note == activeNote ? 'active' : ''}`}
      id={note}
      onClick={handleClick}
    >
      {note[0].toUpperCase()}
    </div>
  )
}

const SM = '../assets/Tuner/Sound Meter/'

const meters = {
  'e-low':  { meter: meterImages[`${SM}E Left Meter.png`],  arrow: meterImages[`${SM}E Left Arrow.png`],  checked: meterImages[`${SM}E Left Checked Arrow.png`] },
  'a':      { meter: meterImages[`${SM}A Meter.png`],       arrow: meterImages[`${SM}A Arrow.png`],       checked: meterImages[`${SM}A Checked Arrow.png`] },
  'd':      { meter: meterImages[`${SM}D Meter.png`],       arrow: meterImages[`${SM}D Arrow.png`],       checked: meterImages[`${SM}D Checked Arrow.png`] },
  'g':      { meter: meterImages[`${SM}G Meter.png`],       arrow: meterImages[`${SM}G Arrow.png`],       checked: meterImages[`${SM}G Checked Arrow.png`] },
  'b':      { meter: meterImages[`${SM}B Meter.png`],       arrow: meterImages[`${SM}B Arrow.png`],       checked: meterImages[`${SM}B Checked Arrow.png`] },
  'e-high': { meter: meterImages[`${SM}E Right Meter.png`], arrow: meterImages[`${SM}E Right Arrow.png`], checked: meterImages[`${SM}E Right Checked Arrow.png`] },
}

export function SoundMeter({ activeNote }) {
  const images = meters[activeNote]
  if (!images) return null

  return (
    <div className="sound-meter">
      <div className={`string-meter meter-${activeNote} active`} id={`meter-${activeNote}`}>
        <img className="meter-image" src={images.meter} alt={`${activeNote} Meter`} />
        <img className="meter-arrow" src={images.arrow} alt={`${activeNote} Arrow`}
             data-unclicked={images.arrow}
             data-clicked={images.checked} />
      </div>
    </div>
  )
}
