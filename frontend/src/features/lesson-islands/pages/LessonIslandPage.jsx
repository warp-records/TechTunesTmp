import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

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
  const debug = searchParams.has('debug')
  const scene = getLessonIslandScene(instrument, level)

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
      <LessonIslandScene scene={scene} />
      {debug && <DebugTileMapper />}
    </>
  )
}
