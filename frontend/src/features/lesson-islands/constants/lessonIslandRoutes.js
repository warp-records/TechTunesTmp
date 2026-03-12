export const LESSON_ISLAND_ROUTE_BASE = '/lesson-islands'
export const LESSON_ISLAND_ROUTE_PATTERN = `${LESSON_ISLAND_ROUTE_BASE}/:instrument/:level`

export function buildLessonIslandPath(instrument, level) {
  return `${LESSON_ISLAND_ROUTE_BASE}/${instrument}/${level}`
}

