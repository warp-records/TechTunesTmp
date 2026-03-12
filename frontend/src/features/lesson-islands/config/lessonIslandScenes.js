import { guitarBeginnerLessonIslandScene } from './guitarBeginnerLessonIslandScene'
import { guitarMediumLessonIslandScene } from './guitarMediumLessonIslandScene'

const lessonIslandScenes = Object.freeze({
  guitar: Object.freeze({
    beginner: guitarBeginnerLessonIslandScene,
    medium: guitarMediumLessonIslandScene,
  }),
})

export function getLessonIslandScene(instrument, level) {
  return lessonIslandScenes[instrument]?.[level] ?? null
}
