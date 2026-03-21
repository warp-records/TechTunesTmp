import { useState, useRef, useEffect } from 'react'

const TILE_COUNT = 25
const RATIO = 2480 / 1600
const STORAGE_KEY = 'debug-tile-mapper-positions'

function makeInitialTiles() {
  return Array.from({ length: TILE_COUNT }, (_, i) => ({
    id: TILE_COUNT - i,
    left: 5 + (i % 5) * 18,
    top: 5 + Math.floor(i / 5) * 18,
    width: 8,
    height: 10,
    rotate: 0,
  }))
}

export default function DebugTileMapper() {
  const [tiles, setTiles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return makeInitialTiles()
  })
  const containerRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragRef.current) return
      const drag = dragRef.current
      const rect = containerRef.current.getBoundingClientRect()
      const { id, mode } = drag

      setTiles(prev => {
      const next = prev.map(t => {
        if (t.id !== id) return t
        if (mode === 'move') {
          const { offsetX, offsetY } = drag
          return {
            ...t,
            left: Math.round(((e.clientX - rect.left - offsetX) / rect.width)  * 1000) / 10,
            top:  Math.round(((e.clientY - rect.top  - offsetY) / rect.height) * 1000) / 10,
          }
        }
        if (mode === 'resize') {
          const { startX, startY, startWidth, startHeight, rectWidth, rectHeight } = drag
          return {
            ...t,
            width:  Math.max(1, Math.round((startWidth  + (e.clientX - startX) / rectWidth  * 100) * 10) / 10),
            height: Math.max(1, Math.round((startHeight + (e.clientY - startY) / rectHeight * 100) * 10) / 10),
          }
        }
        // rotate
        const { centerX, centerY, startAngle, startRotate } = drag
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI
        return {
          ...t,
          rotate: Math.round((startRotate + angle - startAngle) * 10) / 10,
        }
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    }

    function onMouseUp() { dragRef.current = null }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function onMoveDown(e, id) {
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    const tile = tiles.find(t => t.id === id)
    dragRef.current = {
      id, mode: 'move',
      offsetX: e.clientX - rect.left - (tile.left / 100) * rect.width,
      offsetY: e.clientY - rect.top  - (tile.top  / 100) * rect.height,
    }
  }

  function onResizeDown(e, id) {
    e.preventDefault()
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    const tile = tiles.find(t => t.id === id)
    dragRef.current = {
      id, mode: 'resize',
      startX: e.clientX, startY: e.clientY,
      startWidth: tile.width, startHeight: tile.height,
      rectWidth: rect.width, rectHeight: rect.height,
    }
  }

  function onRotateDown(e, id) {
    e.preventDefault()
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    const tile = tiles.find(t => t.id === id)
    const centerX = rect.left + (tile.left / 100) * rect.width  + (tile.width  / 100) * rect.width  / 2
    const centerY = rect.top  + (tile.top  / 100) * rect.height + (tile.height / 100) * rect.height / 2
    dragRef.current = {
      id, mode: 'rotate',
      centerX, centerY,
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI,
      startRotate: tile.rotate ?? 0,
    }
  }

  function exportPositions() {
    const lines = tiles.map(t =>
      `  { id: 'tile-${t.id}', label: 'Tile ${t.id}', href: '#', left: ${t.left}, top: ${t.top}, width: ${t.width}, height: ${t.height}, rotate: ${t.rotate ?? 0}, zIndex: 10 },`
    ).join('\n')
    console.log(lines)
    navigator.clipboard?.writeText(lines)
    alert('Copied to clipboard and logged to console.')
  }

  return (
    <>
      {/* Export button fixed in top-right, above the scene toolbar */}
      <button
        onClick={exportPositions}
        style={{
          position: 'fixed', top: 12, right: 16, zIndex: 10001,
          padding: '8px 20px', borderRadius: 999, border: 'none',
          background: '#fae26b', fontWeight: 700, cursor: 'pointer', fontSize: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        Export tile positions
      </button>

      {/* Fixed overlay matching the scene viewport exactly */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'grid', placeItems: 'center',
        pointerEvents: 'none',
      }}>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: `min(100vw, calc(100dvh * ${RATIO}))`,
            height: `min(100dvh, calc(100vw / ${RATIO}))`,
            pointerEvents: 'none',
          }}
        >
          {tiles.map(tile => (
            <div
              key={tile.id}
              onMouseDown={e => onMoveDown(e, tile.id)}
              style={{
                position: 'absolute',
                left: `${tile.left}%`,
                top: `${tile.top}%`,
                width: `${tile.width}%`,
                height: `${tile.height}%`,
                background: 'rgba(255, 60, 60, 0.35)',
                border: '2px solid red',
                borderRadius: 8,
                cursor: 'grab',
                userSelect: 'none',
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                transform: `rotate(${tile.rotate ?? 0}deg)`,
              }}
            >
              <span style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white', fontWeight: 'bold', fontSize: '1rem',
                textShadow: '0 1px 3px black', pointerEvents: 'none',
              }}>
                {tile.id}
              </span>
              <div
                onMouseDown={e => onResizeDown(e, tile.id)}
                style={{
                  position: 'absolute', bottom: 3, right: 3,
                  width: 12, height: 12,
                  background: 'white', border: '2px solid red',
                  borderRadius: 2, cursor: 'se-resize',
                  pointerEvents: 'auto',
                }}
              />
              <div
                onMouseDown={e => onRotateDown(e, tile.id)}
                style={{
                  position: 'absolute', bottom: 3, left: 3,
                  width: 20, height: 20,
                  background: '#60c8ff', border: '2px solid #0090e0',
                  borderRadius: '50%', cursor: 'crosshair',
                  pointerEvents: 'auto',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
