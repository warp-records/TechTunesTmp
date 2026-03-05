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

export default function Lesson() {
  
  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  
  const ANIM_TIME = 5000;
  const animateNote = time => {
    if (time <= ANIM_TIME) {
      setProgress(time / ANIM_TIME)
    } else {
      setProgress(1.0)
    }
    
    requestRef.current = requestAnimationFrame(animateNote);
  }
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateNote);
    return () => cancelAnimationFrame(animateNote);
  }, [])
  
  return (
    <>
      <HomeButton />
      
      <div className="lesson-stage">
        <img className="layer-board" src={Board} alt="Board" />
        <img className="layer-frame" src={NeonFrame} alt="Neon Board Frame" />
        <img className="layer-strings" src={Strings} alt="Strings" />
        <img className="layer-string-names" src={StringNames} alt="String Names" />
      </div>
      
      <Note string="E_HIGH" fret="3" glow={false} progress={progress} />
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
  
  const xStart = 60 + 11.5 * stringIdx;
  const yStart = 0;
  
  // in viewports
  const xEnd = 49 + stringIdx * 16.05;
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