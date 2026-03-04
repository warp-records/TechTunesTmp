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
    
      <Note string="E_HIGH" fret="3" glow={false} />
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
  if (string == 'E_HIGH') {
    string = "E2"
  }
  
  const noteImgPath = `../../assets/Lesson Page Assets/Notes/${string}/${fret}${glow ? " Glow" : ""}.png`;
  return (
    <img src={noteImages[noteImgPath]} className={`note ${glow ? "glow" : ""}`}></img>
  )
}