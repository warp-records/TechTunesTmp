import { useState } from 'react'

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
  const [showModal, setShowModal] = useState(false)
  
  return (
  <>
    <div className="lesson-island-container" style={{ backgroundImage: `url(${BackgroundImg})` }}>
      <img src={BeginnerPathImg} alt="Beginner Path" className="beginner-path" />
      <img src={MediumPathImg} alt="Medium Path" className="medium-path" />
      <img src={ExpertPathImg} alt="Expert Path" className="expert-path" />
      <img src={HardPathImg} alt="Hard Path" className="hard-path" />
      <img src={BeginnerSignImg} alt="Beginner Sign" className="difficulty-sign beginner-sign" />
      <img src={MediumSignImg} alt="Medium Sign" className="difficulty-sign medium-sign" />
      <img src={ExpertSignImg} alt="Expert Sign" className="difficulty-sign expert-sign" />
      <img src={HardSignImg} alt="Hard Sign" className="difficulty-sign hard-sign" />
        <button onClick={ () => setShowModal(!showModal) }>
          <img src={GuitarSignImg} alt="Guitar Sign" className="guitar-sign" />
        </button>
      
    </div>
    {showModal && <Modal onClose={() => setShowModal(false)} />}
  
  </>
  )
}

export function Modal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="difficulty-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎸 Guitar Lesson Island</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p className="description">Welcome to your central hub for guitar learning! This island contains all the lessons and resources you need to master the guitar.</p>
          <div className="skills-section">
            <h3>How to Use This Island:</h3>
            <ul>
              <li>Choose your difficulty level by clicking on the paths or signs</li>
              <li>Each difficulty offers different challenges and techniques</li>
              <li>Start with Beginner if you're new to guitar</li>
              <li>Progress through levels as you improve</li>
            </ul>
          </div>
          <div className="lessons-section">
            <h3>Available Levels:</h3>
            <ul>
              <li>🟢 Beginner - Basic chords and strumming</li>
              <li>🟠 Medium - Intermediate techniques</li>
              <li>🔴 Hard - Advanced challenges</li>
              <li>🟣 Expert - Master-level skills</li>
            </ul>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  )
}