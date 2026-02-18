import { useRef } from 'react'
import Draggable from 'react-draggable'

import './Avatar.css'

const avatars = import.meta.glob('../assets/Avatar/Avatar[0-9].png', { eager: true, import: 'default' })
const avatarMasks = import.meta.glob('../assets/Avatar/Avatar[0-9]Mask.png', { eager: true, import: 'default' })

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

export const avatarList = Object.values(avatars)

export default function Avatar({ variant, activeItems = {}, color }) {
  const maskList = Object.values(avatarMasks)
  const accessoryRef = useRef(null)
  const eyePos = EYE_POSITIONS[variant] || EYE_POSITIONS[0]
  const mouthPos = MOUTH_POSITIONS[variant] || MOUTH_POSITIONS[0]
  
  return (
  <div class="avatar-image">
      <div class="body-image" style={{backgroundImage: `url(${avatarList[variant]})`}}></div>
      <div class="body-color-layer" style={{
        '--body-color': color || 'transparent',
        WebkitMaskImage: `url(${maskList[variant]})`,
        maskImage: `url(${maskList[variant]})`,
      }}></div>
      <div class="avatar-eyes" style={{
        backgroundImage: activeItems.eye ? `url(${activeItems.eye})` : '',
        top: eyePos.top, left: eyePos.left, width: eyePos.width, height: eyePos.height,
      }}></div>
      <div class="avatar-mouth" style={{
        backgroundImage: activeItems.mouth ? `url(${activeItems.mouth})` : '',
        top: mouthPos.top, left: mouthPos.left, width: mouthPos.width, height: mouthPos.height,
      }}></div>
      {activeItems.accessory && (
        <Draggable nodeRef={accessoryRef}>
          <div ref={accessoryRef} className="avatar-accessory" style={{backgroundImage: `url(${activeItems.accessory})`}}></div>
        </Draggable>
      )}
  </div>
  )
}
