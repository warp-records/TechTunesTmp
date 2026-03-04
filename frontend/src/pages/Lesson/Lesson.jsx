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
  
  return (
    <>
      <HomeButton />
      
      <div className="lesson-stage">
        <img className="layer-board" src={Board} alt="Board" />
        <img className="layer-frame" src={NeonFrame} alt="Neon Board Frame" />
        <img className="layer-strings" src={Strings} alt="Strings" />
        <img className="layer-string-names" src={StringNames} alt="String Names" />
      </div>
      
      <Note string="G" fret="3" glow={false} />
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
  
  let stringIdx = null;
  switch (string) {
    case 'E':
      stringIdx = 0
      break
    
    case 'A':
      stringIdx = 1
      break
    
    case 'D':
      stringIdx = 2
      break
    
    case 'G':
      stringIdx = 3
      break
      
    case 'B':
      stringIdx = 4
      break
      
    case 'E_HIGH':
      stringIdx = 5
      
  }
  
  // in viewports
  const xEnd = 52 + stringIdx * 16.05;
  const yEnd = 91;
  
  const noteImgPath = `../../assets/Lesson Page Assets/Notes/${string_filename}/${fret}${glow ? " Glow" : ""}.png`;
  return (
    <img src={noteImages[noteImgPath]} className={`note ${glow ? "glow" : ""}`}
      style={{
        position: 'absolute',
        left: `${xEnd}vh`,
        top: `91vh`
    }}
    ></img>
  )
}