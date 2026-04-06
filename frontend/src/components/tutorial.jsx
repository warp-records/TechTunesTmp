import { useState } from 'react'

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
    localStorage.removeItem('tutorial')
  }

  function updatePartIdx(idx) {
    setPartIdx(idx)
    writeTutorial(pageIndex, idx)
  }

  const popupProps = {
    messages,
    index: partIdx,
    setIndex: updatePartIdx,
    onClose: close,
  }

  return { tutorialIndex: partIdx, showTutorial, start, close, popupProps }
}
