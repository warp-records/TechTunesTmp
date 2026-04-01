import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useTutorial(messages) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tutorialIndex, setTutorialIndex] = useState(0)
  const [showTutorial, setShowTutorial] = useState(() => searchParams.get("showTutorial") !== null)

  function start() {
    setTutorialIndex(0)
    setShowTutorial(true)
  }

  function close() {
    setShowTutorial(false)
    setTutorialIndex(0)
    searchParams.delete('showTutorial')
    setSearchParams(searchParams)
  }

  const popupProps = {
    messages,
    index: tutorialIndex,
    setIndex: setTutorialIndex,
    onClose: close,
  }

  return { tutorialIndex, showTutorial, start, close, popupProps }
}
