import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import styles from './LessonIslandScene.module.css'
import Avatar from '../../../components/Avatar'
import { resolveBodyBg } from '../../../components/avatarData'
import LessonStars from '../../../components/LessonStars'

function toPercent(value) {
  return typeof value === 'number' ? `${value}%` : value
}

function getAssetStyle(asset) {
  const style = {
    left: toPercent(asset.left ?? 0),
    top: toPercent(asset.top ?? 0),
    zIndex: asset.zIndex,
  }

  if (asset.width != null) {
    style.width = toPercent(asset.width)
  }

  if (asset.height != null) {
    style.height = toPercent(asset.height)
  }

  if (asset.rotate) {
    style.transform = `rotate(${asset.rotate}deg)`
  }

  if (asset.transformOrigin) {
    style.transformOrigin = asset.transformOrigin
  }

  return style
}

function SceneAsset({ asset, className }) {
  return (
    <img
      src={asset.src}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={className}
      style={getAssetStyle(asset)}
      loading="eager"
      decoding="async"
    />
  )
}

function SceneHotspot({ hotspot, isAssigning, onAssignTile, instrument, level, showTutorial, closeTutorial, currentTile, onTileNavigate, bestStars }) {
  const hotspotStyle = {
    left: toPercent(hotspot.left),
    top: toPercent(hotspot.top),
    width: toPercent(hotspot.width),
    height: toPercent(hotspot.height),
    zIndex: hotspot.zIndex,
    ...(hotspot.rotate ? { transform: `rotate(${hotspot.rotate}deg)` } : {}),
  }

  const isTile = hotspot.tile_number != null
  const isUnlocked = isTile && currentTile != null && hotspot.tile_number <= currentTile
  const isCurrentTile = isTile && hotspot.tile_number === currentTile
  const isInteractive = isAssigning ? isTile : isUnlocked

  const classes = [
    styles['lesson-island-scene__hotspot'],
    isAssigning
      ? styles['lesson-island-scene__hotspot--assigning']
      : isInteractive
        ? styles['lesson-island-scene__hotspot--interactive']
        : styles['lesson-island-scene__hotspot--static'],
    isCurrentTile ? styles['lesson-island-scene__hotspot--current'] : '',
    hotspot.status ? styles[`lesson-island-scene__hotspot--${hotspot.status}`] : '',
    `lesson-island-scene__hotspot--${hotspot.id}`,
  ].filter(Boolean).join(' ')

  function handleClick() {
    if (isAssigning && onAssignTile) {
      onAssignTile(hotspot.tile_number)
    } else if (isTile) {
      const path = showTutorial && hotspot.tile_number === 1
        ? '/lesson_tutorial'
        : `/lesson?tile_number=${hotspot.tile_number}&instrument=${instrument}&level=${level}`
      if (showTutorial && hotspot.tile_number === 1) closeTutorial?.()
      onTileNavigate(hotspot.tile_number, path)
    }
  }

  return (
    <div
      className={classes}
      style={hotspotStyle}
      role="button"
      onClick={isInteractive ? handleClick : undefined}
      aria-label={hotspot.label}
      title={hotspot.title ?? hotspot.label}
    >
      <span className={styles['lesson-island-scene__sr-only']}>{hotspot.label}</span>
      {!isInteractive && isTile && <span className={styles['lock-icon']}>🔒</span>}
      {bestStars > 0 && (
        <div className={styles['hotspot-stars']}>
          <LessonStars stars={bestStars} />
        </div>
      )}
    </div>
  )
}

export default function LessonIslandScene({ scene, assignSongId, onAssignTile, showTutorial, closeTutorial, avatarData, currentTile, tileResults = {} }) {
  const navigate = useNavigate()
  const [displayTile, setDisplayTile] = useState(currentTile)
  const navTimeoutRef = useRef(null)

  useEffect(() => { setDisplayTile(currentTile) }, [currentTile])
  useEffect(() => () => { if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current) }, [])

  function handleTileNavigate(tileNumber, path) {
    setDisplayTile(tileNumber)
    navTimeoutRef.current = setTimeout(() => navigate(path), 650)
  }

  const sceneStyle = {
    '--lesson-island-page-fill': scene.canvas.pageFill,
    '--lesson-island-stage-fill': scene.canvas.stageFill,
    '--lesson-island-stage-shadow': scene.canvas.stageShadow,
    '--lesson-island-scene-ratio': scene.canvas.width / scene.canvas.height,
  }

  return (
    <section
      className={`${styles['lesson-island-scene-page']} lesson-island-active`}
      style={sceneStyle}
      aria-labelledby={`${scene.id}-title`}
    >
      <h1 id={`${scene.id}-title`} className={styles['lesson-island-scene__sr-only']}>
        {scene.title}
      </h1>

      <div className={styles['lesson-island-scene-page__toolbar']}>
        <Link to={scene.backHref} className={styles['lesson-island-scene-page__back-link']}>
          {scene.backLabel}
        </Link>
        {assignSongId && (
          <div className={styles['lesson-island-scene-page__assign-banner']}>
            Choose a tile to assign this song to
          </div>
        )}
      </div>

      <div className={styles['lesson-island-scene-page__viewport']}>
        <div className={styles['lesson-island-scene']}>
          {scene.layers.map((layer) => (
            <SceneAsset
              key={layer.id}
              asset={layer}
              className={[styles['lesson-island-scene__layer'], layer.className ?? ''].filter(Boolean).join(' ')}
            />
          ))}

          {scene.hotspots?.map((hotspot) => (
            <SceneHotspot key={hotspot.id} hotspot={hotspot} isAssigning={!!assignSongId} onAssignTile={onAssignTile} instrument={scene.instrument} level={scene.level} showTutorial={showTutorial} closeTutorial={closeTutorial} currentTile={currentTile} onTileNavigate={handleTileNavigate} bestStars={tileResults[hotspot.tile_number] ?? 0} />
          ))}

          {avatarData && displayTile != null && (() => {
            const tile = scene.hotspots?.find(h => h.tile_number === displayTile)
            if (!tile) return null
            return (
              <div
                className={styles['scene-avatar']}
                style={{ left: `${tile.left + tile.width / 2}%`, top: `${tile.top + tile.height / 2}%` }}
              >
                <Avatar form={avatarData.form} activeItems={avatarData.activeItems} bodyTexture={resolveBodyBg(avatarData.bodyBg)} />
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
