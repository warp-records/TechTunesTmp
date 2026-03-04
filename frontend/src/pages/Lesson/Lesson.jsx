import './Lesson.css'
import HomeButton from '../../components/HomeButton'
import Strings from '../../assets/Lesson Page Assets/Strings.png'
import NeonFrame from '../../assets/Lesson Page Assets/Neon Board Frame.png'
import Board from '../../assets/Lesson Page Assets/Board.png'
import StringNames from '../../assets/Lesson Page Assets/String Names.png'

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
    
    </>
  )
}
