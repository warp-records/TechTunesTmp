import './GuitarTuner.css'

import guitarHead from '../assets/Tuner/Buttons/Base Guitar Head.png'
import eLeftString from '../assets/Tuner/Strings/E Left String Clicked.png'
import aString from '../assets/Tuner/Strings/A String Clicked.png'
import dString from '../assets/Tuner/Strings/D String Clicked.png'
import gString from '../assets/Tuner/Strings/G String Clicked.png'
import bString from '../assets/Tuner/Strings/B String Clicked.png'
import eRightString from '../assets/Tuner/Strings/E Right String Clicked.png'

export default function GuitarTuner() {
  return (
    <div className="guitar-container">
      <div className="guitar-headstock">
        <img src={guitarHead} alt="Guitar headstock" className="headstock-image" />
        <div className="guitar-strings">
          <img src={eLeftString} alt="E low string" className="guitar-string string-e-low" id="string-e-low" />
          <img src={aString} alt="A string" className="guitar-string string-a" id="string-a" />
          <img src={dString} alt="D string" className="guitar-string string-d" id="string-d" />
          <img src={gString} alt="G string" className="guitar-string string-g active" id="string-g" />
          <img src={bString} alt="B string" className="guitar-string string-b" id="string-b" />
          <img src={eRightString} alt="E high string" className="guitar-string string-e-high" id="string-e-high" />
        </div>
        <div className="string-letters">
          <div className="string-letter letter-e-low" id="letter-e-low">E</div>
          <div className="string-letter letter-a" id="letter-a">A</div>
          <div className="string-letter letter-d" id="letter-d">D</div>
          <div className="string-letter letter-g active" id="letter-g">G</div>
          <div className="string-letter letter-b" id="letter-b">B</div>
          <div className="string-letter letter-e-high" id="letter-e-high">E</div>
        </div>
      </div>
    </div>
  )
}
