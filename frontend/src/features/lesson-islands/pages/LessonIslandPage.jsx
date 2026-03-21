import { useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'

import LessonIslandScene from '../components/LessonIslandScene'
import DebugTileMapper from '../components/DebugTileMapper'
import { getLessonIslandScene } from '../config/lessonIslandScenes'

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
      <LessonIslandScene scene={scene} assignSongId={assignSongId} onAssignTile={assignSongId ? onAssignTile : null} />
      {debug && <DebugTileMapper />}
    </>
  )
}
