import { Link } from 'react-router-dom'

import './LessonIslandScene.css'

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

function SceneHotspot({ hotspot }) {
  const hotspotStyle = {
    left: toPercent(hotspot.left),
    top: toPercent(hotspot.top),
    width: toPercent(hotspot.width),
    height: toPercent(hotspot.height),
    zIndex: hotspot.zIndex,
  }

  const classes = [
    'lesson-island-scene__hotspot',
    hotspot.href
      ? 'lesson-island-scene__hotspot--interactive'
      : 'lesson-island-scene__hotspot--static',
    hotspot.status
      ? `lesson-island-scene__hotspot--${hotspot.status}`
      : '',
    `lesson-island-scene__hotspot--${hotspot.id}`,
  ]
    .filter(Boolean)
    .join(' ')

  if (hotspot.href) {
    return (
      <Link
        to={hotspot.href}
        className={classes}
        style={hotspotStyle}
        aria-label={hotspot.label}
        title={hotspot.title ?? hotspot.label}
      >
        <span className="lesson-island-scene__sr-only">{hotspot.label}</span>
      </Link>
    )
  }

  return (
    <div
      className={classes}
      style={hotspotStyle}
      role="img"
      aria-label={hotspot.label}
      title={hotspot.title ?? hotspot.label}
    >
      <span className="lesson-island-scene__sr-only">{hotspot.label}</span>
    </div>
  )
}

export default function LessonIslandScene({ scene }) {
  const sceneStyle = {
    '--lesson-island-page-fill': scene.canvas.pageFill,
    '--lesson-island-stage-fill': scene.canvas.stageFill,
    '--lesson-island-stage-shadow': scene.canvas.stageShadow,
    '--lesson-island-scene-ratio': scene.canvas.width / scene.canvas.height,
  }

  return (
    <section
      className="lesson-island-scene-page"
      style={sceneStyle}
      aria-labelledby={`${scene.id}-title`}
    >
      <h1 id={`${scene.id}-title`} className="lesson-island-scene__sr-only">
        {scene.title}
      </h1>

      <div className="lesson-island-scene-page__toolbar">
        <Link to={scene.backHref} className="lesson-island-scene-page__back-link">
          {scene.backLabel}
        </Link>
      </div>

      <div className="lesson-island-scene-page__viewport">
        <div className="lesson-island-scene">
          {scene.layers.map((layer) => (
            <SceneAsset
              key={layer.id}
              asset={layer}
              className={`lesson-island-scene__layer ${layer.className ?? ''}`.trim()}
            />
          ))}

          {scene.hotspots?.map((hotspot) => (
            <SceneHotspot key={hotspot.id} hotspot={hotspot} />
          ))}
        </div>
      </div>
    </section>
  )
}
