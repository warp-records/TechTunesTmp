import { useState } from 'react'
import { Link } from 'react-router-dom'

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
import { LESSON_ISLAND_INSTRUMENTS } from '../../features/lesson-islands/constants/lessonIslandInstruments'
import { LESSON_ISLAND_LEVELS } from '../../features/lesson-islands/constants/lessonIslandLevels'
import { buildLessonIslandPath } from '../../features/lesson-islands/constants/lessonIslandRoutes'

const difficultyNodes = [
  {
    id: LESSON_ISLAND_LEVELS.BEGINNER,
    label: 'Beginner',
    href: buildLessonIslandPath(
      LESSON_ISLAND_INSTRUMENTS.GUITAR,
      LESSON_ISLAND_LEVELS.BEGINNER
    ),
    pathSrc: BeginnerPathImg,
    pathClassName: 'beginner-path',
    signSrc: BeginnerSignImg,
    signClassName: 'difficulty-sign beginner-sign',
  },
  {
    id: LESSON_ISLAND_LEVELS.MEDIUM,
    label: 'Medium',
    href: buildLessonIslandPath(
      LESSON_ISLAND_INSTRUMENTS.GUITAR,
      LESSON_ISLAND_LEVELS.MEDIUM
    ),
    pathSrc: MediumPathImg,
    pathClassName: 'medium-path',
    signSrc: MediumSignImg,
    signClassName: 'difficulty-sign medium-sign',
  },
  {
    id: LESSON_ISLAND_LEVELS.HARD,
    label: 'Hard',
    pathSrc: HardPathImg,
    pathClassName: 'hard-path',
    signSrc: HardSignImg,
    signClassName: 'difficulty-sign hard-sign',
  },
  {
    id: LESSON_ISLAND_LEVELS.EXPERT,
    label: 'Expert',
    pathSrc: ExpertPathImg,
    pathClassName: 'expert-path',
    signSrc: ExpertSignImg,
    signClassName: 'difficulty-sign expert-sign',
  },
]

export default function GuitarIsland() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className="lesson-island-container"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      >
        {difficultyNodes.map((node) => (
          <DifficultyNode key={node.id} node={node} />
        ))}

        <button
          type="button"
          className="guitar-sign-button"
          aria-expanded={showModal}
          aria-controls="guitar-island-modal"
          onClick={() => setShowModal((currentValue) => !currentValue)}
        >
          <img src={GuitarSignImg} alt="Guitar Sign" className="guitar-sign" />
        </button>

      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </>
  )
}

function DifficultyNode({ node }) {
  if (node.href) {
    return (
      <>
        <Link
          to={node.href}
          className="difficulty-link"
          aria-hidden="true"
          tabIndex={-1}
        >
          <img src={node.pathSrc} alt="" aria-hidden="true" className={node.pathClassName} />
        </Link>

        <Link
          to={node.href}
          className="difficulty-link"
          aria-label={`Open ${node.label} lesson island`}
          title={`Open ${node.label} lesson island`}
        >
          <img src={node.signSrc} alt="" aria-hidden="true" className={node.signClassName} />
        </Link>
      </>
    )
  }

  return (
    <>
      <img src={node.pathSrc} alt="" aria-hidden="true" className={node.pathClassName} />
      <img
        src={node.signSrc}
        alt={`${node.label} lesson island coming soon`}
        className={node.signClassName}
      />
    </>
  )
}

export function Modal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="guitar-island-modal"
        className="difficulty-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guitar-island-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="guitar-island-modal-title">Guitar Lesson Island</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <p className="description">
            Welcome to your central hub for guitar learning. Start with the
            beginner island, then progress through the remaining difficulty
            paths as they ship.
          </p>
          <div className="skills-section">
            <h3>How to Use This Island:</h3>
            <ul>
              <li>Choose a difficulty level from the island map</li>
              <li>Start with Beginner if you are new to guitar</li>
              <li>Use the lesson island landmarks to move through the curriculum</li>
              <li>Return here when you are ready for the next level</li>
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
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
