import { useRef } from 'react'
import Draggable from 'react-draggable'

import styles from './Avatar.module.css'
import { assetRegistry } from '../assetRegistry'
import { avatarList, PLAIN_SKINS } from './avatarData'

const avatarMasks = import.meta.glob('../assets/Avatar/Avatar[0-9]Mask.png', { eager: true, import: 'default' })

const bodyTextureGlobs = import.meta.glob('../assets/DressingRoom/BodyTextures/*', { eager: true, import: 'default' })
const bodyTextures = Object.fromEntries(
  Object.entries(bodyTextureGlobs).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url])
)

const EYE_POSITIONS = [
  { top: '50%', left: '57%', width: '90px', height: '45px' },
  { top: '50%', left: '56%', width: '80px', height: '40px' },
  { top: '45%', left: '50%', width: '90px', height: '45px' },
  { top: '55%', left: '49%', width: '80px', height: '40px' },
  { top: '55%', left: '50%', width: '80px', height: '40px' },
]

const MOUTH_POSITIONS = [
  { top: '70%', left: 'calc(50%)', width: '60px', height: '30px' },
  { top: '70%', left: 'calc(50%)', width: '50px', height: '25px' },
  { top: '65%', left: 'calc(50% - 10px)', width: '60px', height: '30px' },
  { top: '75%', left: 'calc(50% - 10px)', width: '45px', height: '22px' },
  { top: '75%', left: 'calc(50% - 12px)', width: '45px', height: '22px' },
]

/**
 * Avatar preview renderer with draggable accessory support.
 *
 * @returns {JSX.Element}
 */
export default function Avatar({ form, activeItems = {}, bodyTexture, onAccessoryDrag }) {
  const avatarRef = useRef(null)
  const maskList = Object.values(avatarMasks)
  const accessoryRef = useRef(null)
  const eyePos = EYE_POSITIONS[form] || EYE_POSITIONS[0]
  const mouthPos = MOUTH_POSITIONS[form] || MOUTH_POSITIONS[0]

  const eyeUrl = activeItems.eye ? assetRegistry.eye[activeItems.eye] : null
  const mouthUrl = activeItems.mouth ? assetRegistry.mouth[activeItems.mouth] : null
  const accessoryName = activeItems.accessory?.name
  const accessoryUrl = accessoryName ? assetRegistry.accessory[accessoryName] : null
  const accessoryPos = { x: activeItems.accessory?.x ?? 0, y: activeItems.accessory?.y ?? 0 }

  const isAccessoryWithinBounds = () => {
    if (!avatarRef.current || !accessoryRef.current) {
      return true
    }

    const avatarRect = avatarRef.current.getBoundingClientRect()
    const accessoryRect = accessoryRef.current.getBoundingClientRect()
    const halfW = accessoryRect.width / 2
    const halfH = accessoryRect.height / 2

    return (
      accessoryRect.right - halfW >= avatarRect.left &&
      accessoryRect.left + halfW <= avatarRect.right &&
      accessoryRect.bottom - halfH >= avatarRect.top &&
      accessoryRect.top + halfH <= avatarRect.bottom
    )
  }

  const handleAccessoryStop = (_event, data) => {
    if (isAccessoryWithinBounds()) {
      onAccessoryDrag?.(data.x, data.y)
      return
    }

    onAccessoryDrag?.(accessoryPos.x, accessoryPos.y)
  }
  
  return (
  <div ref={avatarRef} className={styles['avatar-image']}>
      <div className={styles['body-image']} style={{backgroundImage: `url(${avatarList[form]})`}}></div>
      <div className={styles['body-color-layer']} style={{
        ...(bodyTextures[bodyTexture]
          ? PLAIN_SKINS.has(bodyTexture)
            // plain skins: scale image to match mask's contain-sizing so characters align
            ? {
                backgroundImage: `url(${bodyTextures[bodyTexture]})`,
                backgroundSize: 'contain',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
                WebkitMaskSize: 'contain', maskSize: 'contain',
                WebkitMaskPosition: 'bottom center', maskPosition: 'bottom center',
              }
            // patterns fill the whole masked area
            : { backgroundImage: `url(${bodyTextures[bodyTexture]})`, backgroundSize: 'cover' }
          : { background: bodyTexture || 'transparent' }
        ),
        WebkitMaskImage: `url(${maskList[form]})`,
        maskImage: `url(${maskList[form]})`,
      }}></div>
      <div className={styles['avatar-eyes']} style={{
        backgroundImage: eyeUrl ? `url(${eyeUrl})` : '',
        top: eyePos.top, left: eyePos.left, width: eyePos.width, height: eyePos.height,
      }}></div>
      <div className={styles['avatar-mouth']} style={{
        backgroundImage: mouthUrl ? `url(${mouthUrl})` : '',
        top: mouthPos.top, left: mouthPos.left, width: mouthPos.width, height: mouthPos.height,
      }}></div>
      {accessoryUrl && (
        onAccessoryDrag ? (
          <Draggable nodeRef={accessoryRef} position={accessoryPos}
            onStop={handleAccessoryStop}>
            <div ref={accessoryRef} className={styles['avatar-accessory']} style={{backgroundImage: `url(${accessoryUrl})`}}></div>
          </Draggable>
        ) : (
          <div className={styles['avatar-accessory']} style={{backgroundImage: `url(${accessoryUrl})`, transform: `translate(${accessoryPos.x}px, ${accessoryPos.y}px)`}}></div>
        )
      )}
  </div>
  )
}
