import { useState } from 'react'

const LAST_PAGE_INDEX = 5

function readTutorial() {
  try { return JSON.parse(localStorage.getItem('tutorial')) } catch { return null }
}

function writeTutorial(pageIndex, partIdx) {
  localStorage.setItem('tutorial', JSON.stringify({ pageIndex, partIdx }))
}

export function useTutorial(messages, pageIndex) {
  const stored = readTutorial()
  const isThisPage = stored?.pageIndex === pageIndex

  const [partIdx, setPartIdx] = useState(isThisPage ? (stored.partIdx ?? 0) : 0)
  const [showTutorial, setShowTutorial] = useState(isThisPage)

  function start() {
    writeTutorial(pageIndex, 0)
    setPartIdx(0)
    setShowTutorial(true)
  }

  function close() {
    setShowTutorial(false)
    setPartIdx(0)
    if (pageIndex != null && partIdx === messages.length - 1) {
      writeTutorial(pageIndex + 1, 0)
    } else {
      localStorage.removeItem('tutorial')
    }
  }

  function updatePartIdx(idx) {
    if (idx >= messages.length) {
      close()
      return
    }
    setPartIdx(idx)
    writeTutorial(pageIndex, idx)
  }

  const isLastStep = pageIndex === LAST_PAGE_INDEX && partIdx === messages.length - 1

  const popupProps = {
    messages,
    index: partIdx,
    setIndex: updatePartIdx,
    onClose: close,
    isLastStep,
  }

  return { tutorialIndex: partIdx, showTutorial, start, close, popupProps }
}
