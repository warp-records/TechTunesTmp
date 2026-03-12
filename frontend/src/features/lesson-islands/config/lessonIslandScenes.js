import { guitarBeginnerLessonIslandScene } from './guitarBeginnerLessonIslandScene'
import { guitarHardLessonIslandScene } from './guitarHardLessonIslandScene'
import { guitarMediumLessonIslandScene } from './guitarMediumLessonIslandScene'

const lessonIslandScenes = Object.freeze({
  guitar: Object.freeze({
    beginner: guitarBeginnerLessonIslandScene,
    hard: guitarHardLessonIslandScene,
    medium: guitarMediumLessonIslandScene,
  }),
})

export function getLessonIslandScene(instrument, level) {
  return lessonIslandScenes[instrument]?.[level] ?? null
}
