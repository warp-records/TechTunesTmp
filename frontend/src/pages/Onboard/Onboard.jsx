
import { useState } from 'react';

import Pickbot from '../../components/Pickbot.jsx'
import './Onboard.css'
import './Select.css'

export default function Onboard() {
  const [progIdx, setProgIdx] = useState(0);
  
  function handleContinue() {
    setProgIdx(progIdx + 1);
  }
  
  const pickBotDialogue = [
    "Hi! I'm PickBot, your musical companion!",
    "I'm always here to jam with you! Let's get rocking and make some beautiful music together!",
    "NO SHAME IN STARTING FROM SCRATCH - I GOT YOU!",
    "GREAT CHOICE! NOW LET'S PICK YOUR GUITAR!",
  ]
  
  let continueBtnText = ""
  if (progIdx == 0) {
    continueBtnText = "Let's Start!"
  } else if (progIdx == 1) {
    continueBtnText = "Awesome!"
  } else {
    continueBtnText = "Continue"
  }
  
  let skillOptions = [
    "I've never picked up a guitar (Beginner)",
    "I know most chords/tabs (Medium)",
    "I can play difficult songs (Hard)",
    "I'm Advanced but want to keep growing (Expert)",
  ]
  
  return (
    <>
      <main class="main-container">
        <div class="registration-card">
          <div class="character-section">
            <Pickbot />
            <Dialogue text={pickBotDialogue[progIdx]} />
          </div>
          <Select options={skillOptions} multiSelect={false} />
          <ProgressDots pos={progIdx} />
          <div class="continue-section">
            
            <ContinueBtn text={continueBtnText} onContinue={handleContinue} />
          </div>
        </div>
      </main>
    </>
  )
}

function ContinueBtn({ text, enabled, onContinue }) {
  return (
    <button class="continue-btn" id="continue-btn" onClick={onContinue}>{text}</button>
  )
}

function Dialogue({ text }) {
  return (
    <div class="dialogue-bubble">{text}</div>
  )
}

function ProgressDots({ pos }) {
  let dots = []
  for (let i = 0; i < 6; i++) {
    dots.push(
      <div key={i} className={`progress-dot ${ i == pos ? 'active' : ''}`}></div> 
    )
  }
  
  return (
    <div className="progress-indicator">{dots}</div>
  )
}

function Select({ options, multiSelect }) {
  const items = options.map(option =>
    <div class="skill-option">
      <div className="skill-label">
        <input type={`${ multiSelect ? 'checkbox' : 'radio' }`} name="skillLevel" value="never" id="never" />
        <label>{option}</label>
      </div>
    </div>
  );
  
  return (
      <div class="skill-options">
        {items}
      </div>
  )
}
