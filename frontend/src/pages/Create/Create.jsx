
import { useState, useRef } from 'react'
import Draggable, {DraggableCore} from 'react-draggable'

import './Create.css'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'

const avatars = import.meta.glob('../../assets/Avatar/*.png', { eager: true, import: 'default' })
const eyeGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Eyes/*.png', { eager: true, import: 'default' })
const mouthGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Mouths/*.png', { eager: true, import: 'default' })
const accessoryGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Accessories/*.png', { eager: true, import: 'default' })

export default function Create() {
  const [category, setCategory] = useState("")
  const [avatar, setAvatar] = useState(0)
  const [activeItems, setActiveItems] = useState({})
  
  return (
    <>
      <ChoiceFrame category={category} setCategory={setCategory} activeItems={activeItems} setActiveItems={setActiveItems} />
      <div class="mirror"></div>
      <div class="light"></div>
      <div class="stand"></div>
      <div class="arrow-back" onClick={() => { setAvatar((avatar - 1 + Object.keys(avatars).length) % Object.keys(avatars).length) }}></div>
      <div class="arrow-forward" onClick={() => { setAvatar((avatar + 1) % Object.keys(avatars).length) }}></div>
      <div class="avatar-container">
        <Avatar variant={avatar} activeItems={activeItems} />
        <div class="avatar-slider">
        </div>
      </div>
      
      <div class="floor"></div>
    </>
  )
}


// variant is 0, 1, 2, 3, or 4
export function Avatar({ variant, activeItems = {} }) {
  const avatarList = Object.values(avatars)
  const accessoryRef = useRef(null)
  
  return (
  <div class="avatar-image">
      <div class="body-image" style={{backgroundImage: `url(${avatarList[variant]})`}}></div>
      <div class="body-color-layer"></div>
      <div class="avatar-eyes" style={{backgroundImage: activeItems.eye ? `url(${activeItems.eye})` : ''}}></div>
      <div class="avatar-mouth" style={{backgroundImage: activeItems.mouth ? `url(${activeItems.mouth})` : ''}}></div>
      {activeItems.accessory && (
        <Draggable nodeRef={accessoryRef}>
          <div ref={accessoryRef} className="avatar-accessory" style={{backgroundImage: `url(${activeItems.accessory})`}}></div>
        </Draggable>
      )}
  </div>
  )
}

// category is a string
export function ChoiceFrame({ category, setCategory, activeItems, setActiveItems }) {
  
  const categoryImages = {
    "eye": Object.values(eyeGlobs),
    "mouth": Object.values(mouthGlobs),
    "accessory": Object.values(accessoryGlobs),
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
          <div className="button-icon" onClick={() => { setCategory("body") }} style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>
      
      <div class="choice-frame">
        {category === "body" ? (
          <Spinner />
        ) : (
          <div className={`${category}-options`}>
            {rows.map((rowElems, rowIdx) => (
            <div key={rowIdx} className={`${category}-row`}>
                {rowElems.map((imgSrc, idx) => (
                  <Item key={idx} category={category} img={imgSrc}
                    onClick={() => setActiveItems(prev => ({ ...prev, [category]: imgSrc }))} />
                ))}
            </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function Item({ category, img, onClick }) {
  return (<div className={`${category}-option`} style={{ backgroundImage: `url(${img})` }} onClick={onClick}></div>)
}

const WHEEL_COLORS = [
  { name: 'yellow', hex: '#FFFF00', glowClass: 'glow-yellow' },
  { name: 'teal', hex: '#008B8B', glowClass: 'glow-teal' },
  { name: 'purple', hex: '#8A2BE2', glowClass: 'glow-purple' },
  { name: 'white', hex: '#FFFFFF', glowClass: 'glow-white' },
  { name: 'red', hex: '#FF0000', glowClass: 'glow-red' },
  { name: 'green', hex: '#32CD32', glowClass: 'glow-green' },
  { name: 'blue', hex: '#0000FF', glowClass: 'glow-blue' },
  { name: 'orange', hex: '#FF8C00', glowClass: 'glow-orange' },
]

export function Spinner() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)

  function spin() {
    if (spinning) return
    setSpinning(true)

    const randomRotation = rotation + Math.random() * 360 + (Math.random() * 2.75 + 0.25) * 360

    setRotation(randomRotation)

    setTimeout(() => {
      const finalAngle = randomRotation % 360
      const pointerAngle = (360 - finalAngle) % 360
      const selectedSegment = Math.floor(pointerAngle / 45)
      setSelectedColor(WHEEL_COLORS[selectedSegment])
      setSpinning(false)
    }, 1000)
  }

  return (
    <div className="body-options">
      <div className="color-wheel-container">
        <div className="color-wheel" style={{ transform: `rotate(${rotation}deg)` }}></div>
        <div className={`wheel-pointer ${selectedColor ? selectedColor.glowClass : ''}`}
             style={selectedColor ? { borderTopColor: selectedColor.hex } : {}}></div>
      </div>
      <div className={`spin-button ${spinning ? 'disabled' : ''}`} onClick={spin}>
        {spinning ? 'SPINNING...' : 'SPIN'}
      </div>
    </div>
  )
}
