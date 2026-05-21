import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdSkipNext } from 'react-icons/md'
import styles from './TutorialVideo.module.css'

export default function TutorialVideo({ name }) {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  function handleLoaded() {
    window.scrollTo(0, document.body.scrollHeight)
  }

  let videoSrc = null;
  switch (name) {
    case "lessonTutorial":
      videoSrc = "https://techtunes-assets-public.s3.us-east-1.amazonaws.com/lesson_tutorial.mp4"
  }
    
  
  function handleEnded(e) {
    if (name === 'lessonTutorial') {
      e.target.currentTime = e.target.duration
      navigate('/lesson?tile_number=1&instrument=guitar&level=beginner')
    }
  }

  function handleSkip() {
    navigate('/lesson?tile_number=1&instrument=guitar&level=beginner')
  }

  return (
    <>
      <video src={videoSrc} autoPlay muted playsInline onLoadedData={handleLoaded} onEnded={handleEnded} className={styles['video']} />
      <button onClick={handleSkip} className={styles['skip-button']}>
        <MdSkipNext style={{ width: '100%', height: '100%' }} />
      </button>
    </>
  )
}