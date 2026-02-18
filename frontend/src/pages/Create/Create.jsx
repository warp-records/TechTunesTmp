
import { Route, Link } from 'react-router-dom'
import { useState } from 'react'

import './Create.css'
import Avatar, { avatarList } from '../../components/Avatar'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'
const eyeGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Eyes/*.png', { eager: true, import: 'default' })
const mouthGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Mouths/*.png', { eager: true, import: 'default' })
const accessoryGlobs = import.meta.glob('../../assets/DressingRoom/Dressing/Accessories/*.png', { eager: true, import: 'default' })


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

export default function Create() {
  const [category, setCategory] = useState("")
  const [avatar, setAvatar] = useState(0)
  const [bodyColor, setBodyColor] = useState()
  const [activeItems, setActiveItems] = useState({})
  
  return (
    <>
      <ChoiceFrame category={category} setCategory={setCategory} activeItems={activeItems} setActiveItems={setActiveItems} setBodyColor={setBodyColor} />
      <div class="mirror"></div>
      <div class="light"></div>
      <div class="stand"></div>
      <div class="action-buttons">
        <Link to="/userpage">
          <button class="save-button">Save</button>
        </Link>
        <button class="reset-button">Reset</button>
      </div>
      <div class="arrow-back" onClick={() => { setAvatar((avatar - 1 + avatarList.length) % avatarList.length) }}></div>
      <div class="arrow-forward" onClick={() => { setAvatar((avatar + 1) % avatarList.length) }}></div>
      <div class="avatar-container">
        <Avatar variant={avatar} activeItems={activeItems} color={bodyColor} />
        <div class="avatar-slider">
        </div>
      </div>
      
      <div class="floor"></div>
    </>
  )
}


// category is a string
export function ChoiceFrame({ category, setCategory, activeItems, setActiveItems, setBodyColor }) {
  
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
          <Spinner setBodyColor={setBodyColor} />
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


export function Spinner({ setBodyColor }) {
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
      const color = WHEEL_COLORS[selectedSegment]
      setSelectedColor(color)
      setBodyColor(color.hex)
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
