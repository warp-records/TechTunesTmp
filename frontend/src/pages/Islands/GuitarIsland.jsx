import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import styles from './GuitarIsland.module.css'
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
import HomeButton from '../../components/HomeButton'
import TutorialPopup, { ArrowIndicator } from '../../components/TutorialPopup'
import { useTutorial } from '../../components/tutorial'

const TUTORIAL_MESSAGES = ["Head to the beginner path"]

const buildDifficultyNodes = (styles) => [
  {
    id: LESSON_ISLAND_LEVELS.BEGINNER,
    label: 'Beginner',
    href: buildLessonIslandPath(
      LESSON_ISLAND_INSTRUMENTS.GUITAR,
      LESSON_ISLAND_LEVELS.BEGINNER
    ),
    pathSrc: BeginnerPathImg,
    pathClassName: styles['beginner-path'],
    signSrc: BeginnerSignImg,
    signClassName: [styles['difficulty-sign'], styles['beginner-sign']].join(' '),
  },
  {
    id: LESSON_ISLAND_LEVELS.MEDIUM,
    label: 'Medium',
    href: buildLessonIslandPath(
      LESSON_ISLAND_INSTRUMENTS.GUITAR,
      LESSON_ISLAND_LEVELS.MEDIUM
    ),
    pathSrc: MediumPathImg,
    pathClassName: styles['medium-path'],
    signSrc: MediumSignImg,
    signClassName: [styles['difficulty-sign'], styles['medium-sign']].join(' '),
  },
  {
    id: LESSON_ISLAND_LEVELS.HARD,
    label: 'Hard',
    href: buildLessonIslandPath(
      LESSON_ISLAND_INSTRUMENTS.GUITAR,
      LESSON_ISLAND_LEVELS.HARD
    ),
    pathSrc: HardPathImg,
    pathClassName: styles['hard-path'],
    signSrc: HardSignImg,
    signClassName: [styles['difficulty-sign'], styles['hard-sign']].join(' '),
  },
  {
    id: LESSON_ISLAND_LEVELS.EXPERT,
    label: 'Expert',
    pathSrc: ExpertPathImg,
    pathClassName: styles['expert-path'],
    signSrc: ExpertSignImg,
    signClassName: [styles['difficulty-sign'], styles['expert-sign']].join(' '),
  },
]

export default function GuitarIsland() {
  const [showModal, setShowModal] = useState(false)
  const [searchParams] = useSearchParams()
  const assignSongId = searchParams.get('assignSongId')
  const difficultyNodes = buildDifficultyNodes(styles)
  const beginnerSignRef = useRef(null)
  const { showTutorial, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES)
  const [arrowPos, setArrowPos] = useState(null)

  useEffect(() => {
    if (!showTutorial) { setArrowPos(null); return }
    const rect = beginnerSignRef.current?.getBoundingClientRect()
    console.log(beginnerSignRef)
    console.log(rect)
    if (rect) setArrowPos({ x: rect.left, y: rect.top + rect.height / 2 })
  }, [showTutorial])

  return (
    <>
      <HomeButton />
      <div
        className={styles['lesson-island-container']}
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      >
        {difficultyNodes.map((node, i) => (
          <DifficultyNode key={node.id} node={node} assignSongId={assignSongId} innerRef={i === 0 ? beginnerSignRef : undefined} />
        ))}

        <button
          type="button"
          className={styles['guitar-sign-button']}
          aria-expanded={showModal}
          aria-controls="guitar-island-modal"
          onClick={() => setShowModal((currentValue) => !currentValue)}
        >
          <img src={GuitarSignImg} alt="Guitar Sign" className={styles['guitar-sign']} />
        </button>

      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
      {arrowPos && <ArrowIndicator x={arrowPos.x} y={arrowPos.y} direction="left" />}
    </>
  )
}

function DifficultyNode({ node, assignSongId, innerRef }) {
  if (node.href) {
    const to = assignSongId ? `${node.href}?assignSongId=${assignSongId}` : node.href
    return (
      <>
        <Link
          to={to}
          className={styles['difficulty-link']}
          aria-hidden="true"
          tabIndex={-1}
        >
          <img src={node.pathSrc} alt="" aria-hidden="true" className={node.pathClassName} />
        </Link>

        <span>
          <Link
            to={to}
            className={styles['difficulty-link']}
            aria-label={`Open ${node.label} lesson island`}
            title={`Open ${node.label} lesson island`}
          >
            <img ref={innerRef} src={node.signSrc} alt="" aria-hidden="true" className={node.signClassName} />
          </Link>
        </span>
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
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div
        id="guitar-island-modal"
        className={styles['difficulty-modal']}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guitar-island-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles['modal-header']}>
          <h2 id="guitar-island-modal-title">Guitar Lesson Island</h2>
          <button type="button" className={styles['close-btn']} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles['modal-content']}>
          <p className={styles['description']}>
            Welcome to your central hub for guitar learning. Start with the
            beginner island, then progress through the remaining difficulty
            paths as they ship.
          </p>
          <div className={styles['skills-section']}>
            <h3>How to Use This Island:</h3>
            <ul>
              <li>Choose a difficulty level from the island map</li>
              <li>Start with Beginner if you are new to guitar</li>
              <li>Use the lesson island landmarks to move through the curriculum</li>
              <li>Return here when you are ready for the next level</li>
            </ul>
          </div>
          <div className={styles['lessons-section']}>
            <h3>Available Levels:</h3>
            <ul>
              <li>🟢 Beginner - Basic chords and strumming</li>
              <li>🟠 Medium - Intermediate techniques</li>
              <li>🔴 Hard - Advanced challenges</li>
              <li>🟣 Expert - Master-level skills</li>
            </ul>
          </div>
        </div>
        <div className={styles['modal-actions']}>
          <button type="button" className={[styles['btn'], styles['btn-primary']].join(' ')} onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
