import Pickbot from '../components/Pickbot.jsx'
import './Onboard.css'

export default function Onboard() {
  return (
    <>
    <main class="main-container">
      <div class="registration-card">
        <div class="character-section">
          <Pickbot />
            
          <div class="dialogue-bubble">
            Hi! I'm PickBot, your musical companion!
          </div>
        </div>
  
        <div class="progress-indicator">
          <div class="progress-dot active"></div>
          <div class="progress-dot"></div>
          <div class="progress-dot"></div>
          <div class="progress-dot"></div>
        </div>
  
        <div class="continue-section">
          <a href="reg2.html" class="continue-btn" id="continue-btn">Let's Start!</a>
        </div>
      </div>
    </main>
    </>
  )
}
