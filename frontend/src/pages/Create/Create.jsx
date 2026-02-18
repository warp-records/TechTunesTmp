
import { useState, useRef } from 'react'
import Draggable, {DraggableCore} from 'react-draggable'

import './Create.css'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'

const avatars = import.meta.glob('../../assets/Avatar/*.png', { eager: true, import: 'default' })
const eyes = import.meta.glob('../../assets/DressingRoom/Dressing/Eyes/*.png', { eager: true, import: 'default' })
const mouths = import.meta.glob('../../assets/DressingRoom/Dressing/Mouths/*.png', { eager: true, import: 'default' })
// const hands = import.meta.glob('../../assets/DressingRoom/Dressing/Hands/*.png', { eager: true, import: 'default' })
const accessories = import.meta.glob('../../assets/DressingRoom/Dressing/Accessories/*.png', { eager: true, import: 'default' })

export default function Create() {
  const [category, setCategory] = useState("")
  const [avatar, setAvatar] = useState(0)
  const [eyes, setEyes] = useState(0)
  const [mouth, setMouth] = useState(0)
  
  return (
    <>
      <ChoiceFrame category={category} setCategory={setCategory} />
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
export function ChoiceFrame({ category, setCategory }) {
  
  const testRef = useRef(0)
  
  const [activeIndex, setActiveIndex] = useState(null)
  const [positions, setPositions] = useState({})
  
  const categoryImages = {
    "eye": Object.values(eyes),
    "mouth": Object.values(mouths),
    "accessory": Object.values(accessories),
  }
  
  const itemsPerRow = {
    "eye": 2,
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
      <div className="button-row">
          <div className="button-icon" onClick={() => { setCategory("eye") }} style={{backgroundImage: `url(${eyesBtn})`}}></div>
          <div className="button-icon" onClick={() => { setCategory("mouth") }} style={{backgroundImage: `url(${mouthBtn})`}}></div>
          <div className="button-icon" onClick={() => { setCategory("accessory") }} style={{backgroundImage: `url(${accessoryBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>
      
      <div class="choice-frame">
        <div className={`${category}-options`}>
          {rows.map((rowElems, rowIdx) => (
          <div key={rowIdx} className={`${category}-row`}>
              {rowElems.map((imgSrc, idx) => {
                const globalIdx = rowIdx * perRow + idx
                return (
                  category === "accessory" ?
                    (
                      <Draggable
                        nodeRef={testRef}
                        position={activeIndex === globalIdx ? undefined : { x: 0, y: 0 }}
                        onStart={() => {
                          setActiveIndex(globalIdx)
                          setPositions({})
                        }}
                        onStop={(e, data) => setPositions({ [globalIdx]: { x: data.x, y: data.y } })}
                      >
                        <div ref={testRef} className={`${category}-option ${activeIndex == globalIdx ? 'active' : ''}`} style={{ backgroundImage: `url(${imgSrc})` }}></div>
                      </Draggable>
                    )
                    :
                    (<div ref={testRef} className={`${category}-option`} style={{ backgroundImage: `url(${imgSrc})` }}></div>)
                )
              })}
          </div>
          ))}
        </div>
      </div>
    </>
  )
}