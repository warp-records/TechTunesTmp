import { useState } from 'react'

export function useTutorial(messages) {
  const [tutorialIndex, setTutorialIndex] = useState(0)
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem('showTutorial') !== null)

  function start() {
    localStorage.setItem('showTutorial', '1')
    setTutorialIndex(0)
    setShowTutorial(true)
  }

  function close() {
    setShowTutorial(false)
    setTutorialIndex(0)
    localStorage.removeItem('showTutorial')
  }

  const popupProps = {
    messages,
    index: tutorialIndex,
    setIndex: setTutorialIndex,
    onClose: close,
  }

  return { tutorialIndex, showTutorial, start, close, popupProps }
}
