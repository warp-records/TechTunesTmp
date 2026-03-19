
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './Create.module.css'
import Avatar from '../../components/Avatar'
import { avatarList, serializeAvatar } from '../../components/avatarData'
import { eyeAssets, mouthAssets, accessoryAssets, bodyTextureAssets } from '../../assetRegistry'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'
import padlock from '../../assets/DressingRoom/Dressing/lock.png'


const TORSO_COLORS = [
  { name: 'yellow', hex: '#FFD700', gradient: 'linear-gradient(135deg, #FFFF66, #FFD000)', glowClass: 'glow-yellow' },
  { name: 'teal', hex: '#008B8B', gradient: 'linear-gradient(135deg, #00FFFF, #005555)', glowClass: 'glow-teal' },
  { name: 'purple', hex: '#8A2BE2', gradient: 'linear-gradient(135deg, #DA70D6, #2E0854)', glowClass: 'glow-purple' },
  { name: 'white', hex: '#D0D0D0', gradient: 'linear-gradient(135deg, #FFFFFF 50%, #A0C4FF)', glowClass: 'glow-white' },
  { name: 'red', hex: '#FF2200', gradient: 'linear-gradient(135deg, #FF6666, #8B0000)', glowClass: 'glow-red' },
  { name: 'green', hex: '#32CD32', gradient: 'linear-gradient(135deg, #90EE90, #006400)', glowClass: 'glow-green' },
  { name: 'blue', hex: '#4169E1', gradient: 'linear-gradient(135deg, #6495ED, #0000CD)', glowClass: 'glow-blue' },
  { name: 'orange', hex: '#FF8C00', gradient: 'linear-gradient(135deg, #FFB300, #FF6600)', glowClass: 'glow-orange' },
  { name: 'pink', hex: '#FF69B4', gradient: 'linear-gradient(135deg, #FFB6C1, #FF1493)', glowClass: 'glow-pink' },
]

export default function PickbotEdit() {
  const [category, setCategory] = useState("")
  const [form, setForm] = useState(0)
  const [bodyTexture, setBodyTexture] = useState(TORSO_COLORS[3].gradient)
  const [activeItems, setActiveItems] = useState({})
  const [isPremium, setIsPremium] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    fetch("/api/check-premium", {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => res.json()).then(data => setIsPremium(data.is_premium))
  }, [])
  
  function saveAvatar() {
    const token = localStorage.getItem("token")
    fetch('/api/save-avatar/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: serializeAvatar({ form, bodyTexture, activeItems })
    })
    
    navigate('/userpage')
  }
  
  return (
    <>
      <ChoiceFrame category={category} setCategory={setCategory} setActiveItems={setActiveItems} setBodyTexture={setBodyTexture} isPremium={isPremium} />
      <div className={styles['dressing-scene']}>
        <div className={styles['light']}></div>
        <div className={styles['mirror']}></div>
        <div className={styles['stand']}></div>
        <div className={styles['avatar-container']}>
          <Avatar form={form} activeItems={activeItems} bodyTexture={bodyTexture}
            onAccessoryDrag={(x, y) => setActiveItems(prev => ({
              ...prev, accessory: { ...prev.accessory, x, y },
            }))} />
          <div className={styles['avatar-slider']}></div>
        </div>
        <div className={styles['arrow-back']} onClick={() => { setForm((form - 1 + avatarList.length) % avatarList.length) }}></div>
        <div className={styles['arrow-forward']} onClick={() => { setForm((form + 1) % avatarList.length) }}></div>
      </div>
      <div className={styles['action-buttons']}>
        <button className={styles['save-button']} onClick={saveAvatar}>Save</button>
        <button className={styles['reset-button']} onClick={() => { setActiveItems({}); setForm(0); setBodyTexture(TORSO_COLORS[3].gradient); } }>
          Reset
        </button>
      </div>

      <div className={styles['floor']}></div>
    </>
  )
}


/**
 * Choice frame for avatar part categories and body color controls.
 *
 * @param {Object} props
 * @param {string} props.category Selected part category.
 * @param {(category: string) => void} props.setCategory Category setter.
 * @param {(next: Object|((prev: Object) => Object)) => void} props.setActiveItems Active item setter.
 * @param {(color: string|undefined) => void} props.setBodyTexture Body color setter.
 * @returns {JSX.Element}
 */
export function ChoiceFrame({ category, setCategory, setActiveItems, setBodyTexture, isPremium }) {
  
  const categoryAssets = {
    "eye": Object.entries(eyeAssets),
    "mouth": Object.entries(mouthAssets),
    "accessory": Object.entries(accessoryAssets),
  }
  
  const itemsPerRow = {
    "eye": 2,
    "mouth": 3,
    "accessory": 5,
  }
  
  const entries = categoryAssets[category] || [];
  const perRow = itemsPerRow[category] || 0
  
  let rows = []
  for (let i = 0; i < entries.length; i += perRow) {
    rows.push(entries.slice(i, i + perRow))
  }
  
  return (
    <>
      <div className={styles['button-row']}>
          <div className={styles['button-icon']} onClick={() => { setCategory("eye") }} style={{backgroundImage: `url(${eyesBtn})`}}></div>
          <div className={styles['button-icon']} onClick={() => { setCategory("mouth") }} style={{backgroundImage: `url(${mouthBtn})`}}></div>
          <div className={styles['button-icon']} onClick={() => { setCategory("accessory") }} style={{backgroundImage: `url(${accessoryBtn})`}}></div>
          <div className={styles['button-icon']} onClick={() => { setCategory("body") }} style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>

      <div className={styles['choice-frame']}>
        {category === "body" ? (
          <BodyTexturePicker key="body" setBodyTexture={setBodyTexture} isPremium={isPremium} />
        ) : (
          <div key={category} className={styles[`${category}-options`]}>
            {rows.map((rowElems, rowIdx) => (
            <div key={rowIdx} className={styles[`${category}-row`]}>
                {rowElems.map(([name, url], idx) => (
                  <Item key={idx} category={category} img={url}
                    onClick={() => setActiveItems(prev => ({
                      ...prev,
                      [category]: category === 'accessory'
                        ? { name, x: 0, y: 0 }
                        : name,
                    }))} />
                ))}
            </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Generic selectable item tile inside the choice frame.
 *
 * @param {Object} props
 * @param {string} props.category Category for class naming.
 * @param {string} props.img Asset URL used as background image.
 * @param {() => void} props.onClick Click handler.
 * @returns {JSX.Element}
 */
export function Item({ category, img, onClick }) {
  return (<div className={styles[`${category}-option`]} style={{ backgroundImage: `url(${img})` }} onClick={onClick}></div>)
}


/**
 * Body color selector with spin and drag interactions.
 *
 * @param {Object} props
 * @param {(color: string) => void} props.setBodyTexture Body color setter.
 * @returns {JSX.Element}
 */
export function BodyTexturePicker({ setBodyTexture, isPremium }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const wheelRef = useRef(null)
  const spinTimeoutRef = useRef(null)
  const dragStartAngleRef = useRef(null)
  const dragStartRotationRef = useRef(0)

  const segmentAngle = 360 / TORSO_COLORS.length

  const normalizeAngle = useCallback((angle) => {
    return ((angle % 360) + 360) % 360
  }, [])

  const getColorForRotation = useCallback(
    (rotationValue) => {
      const finalAngle = normalizeAngle(rotationValue)
      const pointerAngle = normalizeAngle(360 - finalAngle)
      const selectedSegment = Math.floor(pointerAngle / segmentAngle) % TORSO_COLORS.length
      return TORSO_COLORS[selectedSegment]
    },
    [normalizeAngle, segmentAngle]
  )

  const applyColorForRotation = useCallback(
    (rotationValue) => {
      const color = getColorForRotation(rotationValue)
      setSelectedColor(color)
      setBodyTexture(color.gradient)
    },
    [getColorForRotation, setBodyTexture]
  )

  const getPointerAngle = useCallback((clientX, clientY) => {
    if (!wheelRef.current) {
      return null
    }

    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY

    return normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI + 90)
  }, [normalizeAngle])

  /**
   * Keeps deltas in the shortest circular direction to avoid jumps
   * around the 0/360 boundary while dragging.
   *
   */
  const normalizeDelta = useCallback((delta) => {
    if (delta > 180) {
      return delta - 360
    }
    if (delta < -180) {
      return delta + 360
    }
    return delta
  }, [])

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Spins the wheel with inertia-style random rotation and commits the
   * resulting body color when animation completes.
   */
  function spin() {
    if (spinning || isDragging) return
    setSpinning(true)

    const randomRotation = rotation + Math.random() * 360 + (Math.random() * 2.75 + 0.25) * 360

    setRotation(randomRotation)

    if (spinTimeoutRef.current) {
      window.clearTimeout(spinTimeoutRef.current)
    }

    spinTimeoutRef.current = window.setTimeout(() => {
      applyColorForRotation(randomRotation)
      setSpinning(false)
    }, 1000)
  }

  /**
   * Starts drag selection by capturing pointer and storing baseline angle.
   */
  function handlePointerDown(event) {
    if (spinning) return

    const startAngle = getPointerAngle(event.clientX, event.clientY)
    if (startAngle === null) return

    setIsDragging(true)
    dragStartAngleRef.current = startAngle
    dragStartRotationRef.current = rotation
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  /**
   * Updates wheel rotation and selected color while dragging.
   */
  function handlePointerMove(event) {
    if (!isDragging || dragStartAngleRef.current === null) return

    const currentAngle = getPointerAngle(event.clientX, event.clientY)
    if (currentAngle === null) return

    const delta = normalizeDelta(currentAngle - dragStartAngleRef.current)
    const nextRotation = dragStartRotationRef.current + delta

    setRotation(nextRotation)
    applyColorForRotation(nextRotation)
  }

  /**
   * Ends drag selection and releases pointer capture.
   */
  function handlePointerUp(event) {
    if (!isDragging) return

    setIsDragging(false)
    dragStartAngleRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className={styles['body-options']}>
      <div className={styles['body-left-col']}>
        <div className={[styles['spin-button'], spinning ? styles['disabled'] : ''].filter(Boolean).join(' ')} onClick={spin}>
          {spinning ? 'SPINNING...' : 'SPIN'}
        </div>
        <div className={styles['color-wheel-container']}>
          <div
            ref={wheelRef}
            className={[styles['color-wheel'], isDragging ? styles['dragging'] : ''].filter(Boolean).join(' ')}
            style={{ transform: `rotate(${rotation}deg)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          ></div>
          <div className={[styles['wheel-pointer'], selectedColor ? styles[selectedColor.glowClass] : ''].filter(Boolean).join(' ')}
               style={selectedColor ? { borderTopColor: selectedColor.hex } : {}}></div>
        </div>
      </div>
      {Object.entries(bodyTextureAssets).length > 0 && (
        <div className={styles['texture-grid']}>
          {Object.entries(bodyTextureAssets).map(([name, url]) => (
            <div
              key={name}
              className={styles['texture-cell']}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => setBodyTexture(name)}
            >
              {!isPremium && <img src={padlock} className={styles['texture-padlock']} alt="locked" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
