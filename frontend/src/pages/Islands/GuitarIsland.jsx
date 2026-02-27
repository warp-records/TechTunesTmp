import './GuitarIsland.css'
import BackgroundImg from '../../assets/Homepage/LessonIsland/Background@4x.png'
import BeginnerPathImg from '../../assets/Homepage/LessonIsland/Beginner Path with grass@4x.png'
import MediumPathImg from '../../assets/Homepage/LessonIsland/Medium Path With Grass@4x.png'
import ExpertPathImg from '../../assets/Homepage/LessonIsland/Expert Path with Grass@4x.png'
import HardPathImg from '../../assets/Homepage/LessonIsland/Hard Path with Grass@4x.png'
import BeginnerSignImg from '../../assets/Homepage/LessonIsland/Beginner Sign@4x.png'
import MediumSignImg from '../../assets/Homepage/LessonIsland/Medium Sign@4x.png'
import ExpertSignImg from '../../assets/Homepage/LessonIsland/Expert Sign@4x.png'
import HardSignImg from '../../assets/Homepage/LessonIsland/Hard Sign@4x.png'
import GuitarSignImg from '../../assets/Homepage/LessonIsland/Guitar Sign@4x.png'

export default function GuitarIsland() {
  return (
    <div className="lesson-island-container" style={{ backgroundImage: `url(${BackgroundImg})` }}>
      <img src={BeginnerPathImg} alt="Beginner Path" className="beginner-path" />
      <img src={MediumPathImg} alt="Medium Path" className="medium-path" />
      <img src={ExpertPathImg} alt="Expert Path" className="expert-path" />
      <img src={HardPathImg} alt="Hard Path" className="hard-path" />
      <img src={BeginnerSignImg} alt="Beginner Sign" className="difficulty-sign beginner-sign" />
      <img src={MediumSignImg} alt="Medium Sign" className="difficulty-sign medium-sign" />
      <img src={ExpertSignImg} alt="Expert Sign" className="difficulty-sign expert-sign" />
      <img src={HardSignImg} alt="Hard Sign" className="difficulty-sign hard-sign" />
      <img src={GuitarSignImg} alt="Guitar Sign" className="guitar-sign" />
    </div>
  )
}
