const starImages = import.meta.glob(
  '../assets/Lesson Page Assets/Stars/*.svg',
  { eager: true, import: 'default' }
)

export default function LessonStars({ stars }) {
  const src = starImages[`../assets/Lesson Page Assets/Stars/${stars}_star.svg`]
  if (!src) return null
  return <img src={src} alt={`${stars} star${stars !== 1 ? 's' : ''}`} />
}
