import { useEffect, useCallback, useState, useRef } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'

import LessonIslandScene from '../components/LessonIslandScene'
import levelUnlockSrc from '../../../assets/sounds/level_unlock.mp3'
import { resolveBodyBg } from '../../../components/avatarData'
import DebugTileMapper from '../components/DebugTileMapper'
import { getLessonIslandScene } from '../config/lessonIslandScenes'
import TutorialPopup, { ArrowIndicator } from '../../../components/TutorialPopup'
import { useTutorial } from '../../../components/tutorial'

const TUTORIAL_MESSAGES = ["Click to try out your first lesson!"]

function formatSegment(segment) {
  if (!segment) {
    return ''
  }

  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function LessonIslandPage() {
  useEffect(() => { window.scrollTo(0, document.body.scrollHeight) }, [])
  const { instrument = '', level = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const debug = searchParams.has('debug')
  const assignSongId = searchParams.get('assignSongId')
  const scene = getLessonIslandScene(instrument, level)
  const { showTutorial, close: closeTutorialBase, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES, 5)
  const playLessonTutorial = showTutorial || localStorage.getItem('needLessonTutorial') === 'true'
  function closeTutorial() { localStorage.removeItem('needLessonTutorial'); closeTutorialBase() }
  const [arrowPos, setArrowPos] = useState(null)
  const [avatarData, setAvatarData] = useState(null)
  const [currentTile, setCurrentTile] = useState(null)
  const [tileResults, setTileResults] = useState({})
  const [tileSongNames, setTileSongNames] = useState({})
  const [tileUnlocked] = useState(() => localStorage.getItem('tileUnlocked') === 'true')
  const [jumpToNextLesson] = useState(() => localStorage.getItem('jumpToNextLesson') === 'true')
  useEffect(() => { localStorage.removeItem('tileUnlocked'); localStorage.removeItem('jumpToNextLesson') }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/all_songs_meta')
      .then(res => res.ok ? res.json() : [])
      .then(songs => {
        const names = {}
        for (const song of songs) {
          for (const tile of song.tiles ?? []) {
            if (tile.instrument === instrument && tile.level === level) {
              names[tile.tile_number] = song.name
            }
          }
        }
        setTileSongNames(names)
      })

    fetch('/api/get-avatar/', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setAvatarData(data.avatar) })

    fetch('/api/get_progress', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return
        const row = data.progress.find(p => p.instrument === instrument && p.level === level)
        if (row) {
          if (tileUnlocked && row.unlocked_tile > 1) {
            setCurrentTile(row.unlocked_tile - 1)
            setTimeout(() => {
              setCurrentTile(row.unlocked_tile)
              new Audio(levelUnlockSrc).play()
              if (jumpToNextLesson) {
                setTimeout(() => {
                  navigate(`/lesson?tile_number=${row.unlocked_tile}&instrument=${instrument}&level=${level}`)
                }, 1800)
              }
            }, 800)
          } else {
            setCurrentTile(row.unlocked_tile)
          }
        }
        const results = {}
        for (const r of data.tile_results ?? []) {
          if (r.instrument === instrument && r.level === level) {
            results[r.tile_number] = r.best_stars
          }
        }
        setTileResults(results)
      })
  }, [instrument, level])

  useEffect(() => {
    if (!showTutorial) { setArrowPos(null); return }
    const el = document.querySelector('.lesson-island-scene__hotspot--tile-1')
    const rect = el?.getBoundingClientRect()
    if (rect) setArrowPos({ x: rect.left, y: rect.top + rect.height / 2 })
  }, [showTutorial])

  const onAssignTile = useCallback(async (tileNumber) => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      tile_number: tileNumber,
      instrument,
      level,
      song_id: assignSongId,
    })
    const res = await fetch(`/api/assign_lesson_tile?${params}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    })
    if (res.ok) navigate(`/admin?assignedSong=${assignSongId}`)
  }, [instrument, level, assignSongId, navigate])

  if (!scene) {
    const readableInstrument = formatSegment(instrument)
    const readableLevel = formatSegment(level)

    return (
      <section className="lesson-island-scene-page lesson-island-scene-page--empty">
        <div className="lesson-island-scene-page__empty-card">
          <h1>{`${readableInstrument} ${readableLevel}`.trim()} Island</h1>
          <p>
            This lesson island route exists, but the scene for it has not been
            shipped yet.
          </p>
          <Link to="/guitar_island" className="lesson-island-scene-page__back-link">
            Back to Guitar Island
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <LessonIslandScene scene={scene} assignSongId={assignSongId} onAssignTile={assignSongId ? onAssignTile : null} showTutorial={showTutorial} playTutorial={playLessonTutorial} closeTutorial={closeTutorial} avatarData={avatarData} currentTile={currentTile} tileResults={tileResults} tileSongNames={tileSongNames} />
      {debug && <DebugTileMapper />}
      {showTutorial && <TutorialPopup {...tutorialPopupProps} />}
      {arrowPos && <ArrowIndicator x={arrowPos.x} y={arrowPos.y} direction="right" />}
    </>
  )
}
