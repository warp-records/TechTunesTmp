
import { useState } from 'react';

import Pickbot from '../components/Pickbot.jsx'
import './Onboard.css'

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
  
  return (
    <>
    <main class="main-container">
      <div class="registration-card">
        <div class="character-section">
          <Pickbot />
          <Dialogue text={pickBotDialogue[progIdx]} />
            
        </div>
  
          <Progress pos={progIdx} />
          
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

function Progress({ pos }) {
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