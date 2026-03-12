import { guitarBeginnerLessonIslandScene } from './guitarBeginnerLessonIslandScene'

const lessonIslandScenes = Object.freeze({
  guitar: Object.freeze({
    beginner: guitarBeginnerLessonIslandScene,
  }),
})

export function getLessonIslandScene(instrument, level) {
  return lessonIslandScenes[instrument]?.[level] ?? null
}

