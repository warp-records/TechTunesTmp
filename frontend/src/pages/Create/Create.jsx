
import { useState } from 'react'

import './Create.css'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'

const avatars = import.meta.glob('../../assets/Avatar/*.png', { eager: true, import: 'default' })
const eyes = import.meta.glob('../../assets/DressingRoom/Dressing/Eyes/*.png', { eager: true, import: 'default' })
const mouths = import.meta.glob('../../assets/DressingRoom/Dressing/Mouths/*.png', { eager: true, import: 'default' })
// const hands = import.meta.glob('../../assets/DressingRoom/Dressing/Hands/*.png', { eager: true, import: 'default' })
const accessories = import.meta.glob('../../assets/DressingRoom/Dressing/Mouth/*.png', { eager: true, import: 'default' })

export default function Create() {
  const [avatar, setAvatar] = useState(0)
  const [eyes, setEyes] = useState(0)
  const [mouth, setMouth] = useState(0)
  
  return (
    <>
      <ChoiceFrame category={"eyes"} />
      <div class="mirror"></div>
      <div class="light"></div>
      <div class="stand"></div>
      <div class="arrow-back" onClick={() => { setAvatar((avatar - 1 + Object.keys(avatars).length) % Object.keys(avatars).length) }}></div>
      <div class="arrow-forward" onClick={() => { setAvatar((avatar + 1) % Object.keys(avatars).length) }}></div>
      <div class="avatar-container">
        <Avatar variant={avatar}/>
        <div class="avatar-slider">
        </div>
      </div>
      
      <div class="floor"></div>
    </>
  )
}


// variant is 0, 1, 2, 3, or 4
export function Avatar({ variant, color, eyes, mouth, accessory }) {
  const avatarList = Object.values(avatars)
  
  return (
  <div class="avatar-image">
      <div class="body-image" style={{backgroundImage: `url(${avatarList[variant]})`}}></div>
      <div class="body-color-layer"></div>
      <div class="avatar-eyes"></div>
      <div class="avatar-mouth"></div>
      <div class="avatar-accessory"></div>
  </div>
  )
}

// category is a string
export function ChoiceFrame({ category }) {
  
  const categoryImages = {
    "eyes": Object.values(eyes),
    "mouth": Object.values(mouths),
    "accessory": Object.values(accessories),
  }
  
  const itemsPerRow = {
    "eyes": 2,
    "mouth": 3,
    "accessory": 5,
  }
  
  const images = categoryImages[category] || [];
  const perRow = itemsPerRow[category] || 0
  
  let rows = []
  for (let i = 0; i < images.length; i += perRow) {
    rows.push(images.slice(i, i + perRow))
  }
  
  
  return (
    <>
      <div className={`${category}-options`}>
        {rows.map((rowElems, rowIdx) => (
        <div key={rowIdx} className={`${category}-row`}>
            {rowElems.map((imgSrc, idx) => (
              <div key={idx} className={`${category}-option`} style={{ backgroundImage: `url(${imgSrc})`}}></div>
            ))}
        </div>
        ))}
      </div>
      <div className="button-row">
          <div className="button-icon" style={{backgroundImage: `url(${eyesBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${mouthBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${accessoryBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>
      <div class="choice-frame"></div>
    </>
  )
}