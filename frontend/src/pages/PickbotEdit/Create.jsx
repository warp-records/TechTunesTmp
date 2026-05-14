
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'

import styles from './Create.module.css'
import Avatar from '../../components/Avatar'
import TutorialPopup, { ArrowIndicator } from '../../components/TutorialPopup'
import { useTutorial } from '../../components/tutorial'
import { avatarList, serializeAvatar, resolveBodyBg, TORSO_COLORS, isPremiumSkin, DEFAULT_SKIN, PLAIN_SKINS } from '../../components/avatarData'
import { eyeAssets, mouthAssets, accessoryAssets, bodyTextureAssets } from '../../assetRegistry'
import { LuLock } from 'react-icons/lu'
import eyesBtn from '../../assets/DressingRoom/Dressing/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Dressing/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Dressing/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Dressing/Body Button.png'
import padlock from '../../assets/DressingRoom/Dressing/lock.png'



export default function PickbotEdit() {
  const [category, setCategory] = useState("")
  const [form, setForm] = useState(0)
  const [slideDir, setSlideDir] = useState('right')
  const [animKey, setAnimKey] = useState(0)

  const prevForm = slideDir === 'right'
    ? (form - 1 + avatarList.length) % avatarList.length
    : (form + 1) % avatarList.length
  const [bodyBg, setBodyBg] = useState(DEFAULT_SKIN)
  const [activeItems, setActiveItems] = useState({})
  const [isPremium, setIsPremium] = useState(false)
  const [premiumPopupVisible, setPremiumPopupVisible] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const isBetaTester = user?.beta_tester ?? false
  const { tutorialIndex, showTutorial, start: startTutorial, popupProps: tutorialPopupProps } = useTutorial(TUTORIAL_MESSAGES, 0)
  
  const eyesBtnRef = useRef(null)
  const firstEyeRef = useRef(null)
  const mouthBtnRef = useRef(null)
  const accessoryBtnRef = useRef(null)
  const bodyBtnRef = useRef(null)
  const formArrowRef = useRef(null)
  
  useEffect(() => {
    setPremiumPopupVisible(false)
  }, [category])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    fetch("/api/check-premium", {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => res.json()).then(data => setIsPremium(data.is_premium))

    fetch("/api/get-avatar/", {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
      if (!res.ok) return
      return res.json()
    }).then(data => {
      if (!data) return
      const { form, bodyBg, activeItems } = data.avatar
      setForm(form)
      setBodyBg(bodyBg)
      setActiveItems(activeItems)
    })
  }, [])
  
  function saveAvatar() {
    const token = localStorage.getItem("token")
    fetch('/api/save-avatar/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: serializeAvatar({ form, bodyBg, activeItems })
    })

    // pick up on the next page when this is clicked
    if (showTutorial) {
      localStorage.setItem('tutorial', JSON.stringify({ pageIndex: 1, partIdx: 0 }))
    }
    navigate('/userpage')
  }
  
  return (
    <>
      <ChoiceFrame category={category} setCategory={setCategory} setActiveItems={setActiveItems} setBodyBg={setBodyBg} isPremium={isPremium} isBetaTester={isBetaTester} onPremiumRequired={() => setPremiumPopupVisible(true)} onPremiumDismissed={() => setPremiumPopupVisible(false)} tutorialIndex={tutorialIndex} eyesBtnRef={eyesBtnRef} firstEyeRef={firstEyeRef} mouthBtnRef={mouthBtnRef} accessoryBtnRef={accessoryBtnRef} bodyBtnRef={bodyBtnRef} />
      <div className={[styles['premium-popup'], premiumPopupVisible ? styles['premium-popup-visible'] : ''].join(' ')}>
        <p>Go premium to unlock this skin!</p>
        <button onClick={() => navigate('/payment')}>Go Premium</button>
      </div>
      <div className={styles['dressing-scene']}>
        <div className={styles['light']}></div>
        <div className={styles['mirror']}></div>
        <div className={styles['stand']}></div>
        <div className={styles['avatar-container']}>
          {animKey > 0 && (
            // for sliding animation
            <div key={`exit-${animKey}`} className={styles[slideDir === 'right' ? 'avatar-exit-left' : 'avatar-exit-right']}>
              <Avatar form={prevForm} activeItems={activeItems} bodyTexture={resolveBodyBg(bodyBg)} />
            </div>
          )}
          <div key={`enter-${animKey}`} className={animKey > 0 ? styles[slideDir === 'right' ? 'avatar-enter-right' : 'avatar-enter-left'] : ''}>
            <Avatar form={form} activeItems={activeItems} bodyTexture={resolveBodyBg(bodyBg)}
              onAccessoryDrag={(x, y) => setActiveItems(prev => ({
                ...prev, accessory: { ...prev.accessory, x, y },
              }))} />
          </div>
        </div>
        <div className={[styles['arrow-back'], tutorialIndex === 6 ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setSlideDir('left'); setForm((form - 1 + avatarList.length) % avatarList.length); setAnimKey(k => k + 1) }}></div>
        <div ref={formArrowRef} className={[styles['arrow-forward'], tutorialIndex === 6 ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setSlideDir('right'); setForm((form + 1) % avatarList.length); setAnimKey(k => k + 1) }}></div>
      </div>
      <div className={styles['action-buttons']}>
        <button
          className={[styles['save-button'], isPremiumSkin(bodyBg) && !isPremium ? styles['save-button-locked'] : '', tutorialIndex === 7 ? styles['tutorial-glow-save'] : ''].join(' ')}
          disabled={isPremiumSkin(bodyBg) && !isPremium}
          onClick={saveAvatar}
        >Save</button>
        <button className={styles['reset-button']} onClick={() => { setActiveItems({}); setForm(0); setBodyBg(DEFAULT_SKIN); } }>
          Reset
        </button>
        <button className={styles['tutorial-button']} onClick={startTutorial}>?</button>
      </div>

      <div className={styles['floor']}></div>
      {showTutorial && tutorialIndex < TUTORIAL_MESSAGES.length && <TutorialPopup {...tutorialPopupProps} />}
      {/* tutorial arrow */}
      {showTutorial && (() => {
        const ref = { 1: eyesBtnRef, 2: firstEyeRef, 3: mouthBtnRef, 4: accessoryBtnRef, 5: bodyBtnRef, 6: formArrowRef }[tutorialIndex]
        console.log(ref)
        const rect = ref?.current?.getBoundingClientRect()
        console.log(rect)
        return rect ? <ArrowIndicator x={rect.left} y={rect.top + rect.height / 2 - 10} direction="right" /> : null
      })()}
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
const BETA_ACCESSORIES = new Set(["beta badge"])

export function ChoiceFrame({ category, setCategory, setActiveItems, setBodyBg, isPremium, isBetaTester, onPremiumRequired, onPremiumDismissed, tutorialIndex, eyesBtnRef, firstEyeRef, mouthBtnRef, accessoryBtnRef, bodyBtnRef }) {
  const tutorialGlowFor = { 1: 'eye', 3: 'mouth', 4: 'accessory', 5: 'body' }

  const categoryAssets = {
    "eye": Object.entries(eyeAssets),
    "mouth": Object.entries(mouthAssets),
    "accessory": Object.entries(accessoryAssets).filter(([name]) => !BETA_ACCESSORIES.has(name) || isBetaTester),
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
    <div className={styles['choice-frame']}>
      {category === "body" ? (
        <BodyTexturePicker key="body" setBodyBg={setBodyBg} isPremium={isPremium} onPremiumRequired={onPremiumRequired} onPremiumDismissed={onPremiumDismissed} />
      ) : (
        <div key={category} className={styles[`${category}-options`]}>
          {rows.map((rowElems, rowIdx) => (
          <div key={rowIdx} className={styles[`${category}-row`]}>
              {rowElems.map(([name, url], idx) => (
                <Item key={idx} category={category} img={url}
                  innerRef={rowIdx === 0 && idx === 0 && category === 'eye' ? firstEyeRef : undefined}
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
      <div className={styles['button-row']}>
          <div ref={eyesBtnRef} className={[styles['button-icon'], tutorialGlowFor[tutorialIndex] === 'eye' ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setCategory("eye") }} style={{backgroundImage: `url(${eyesBtn})`}}></div>
          <div ref={mouthBtnRef} className={[styles['button-icon'], tutorialGlowFor[tutorialIndex] === 'mouth' ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setCategory("mouth") }} style={{backgroundImage: `url(${mouthBtn})`}}></div>
          <div ref={accessoryBtnRef} className={[styles['button-icon'], tutorialGlowFor[tutorialIndex] === 'accessory' ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setCategory("accessory") }} style={{backgroundImage: `url(${accessoryBtn})`}}></div>
          <div ref={bodyBtnRef} className={[styles['button-icon'], tutorialGlowFor[tutorialIndex] === 'body' ? styles['tutorial-glow'] : ''].join(' ')} onClick={() => { setCategory("body") }} style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>
    </div>
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
export function Item({ category, img, onClick, innerRef }) {
  return (<div ref={innerRef} className={styles[`${category}-option`]} style={{ backgroundImage: `url(${img})` }} onClick={onClick}></div>)
}


/**
 * Body color selector with spin and drag interactions.
 *
 * @param {Object} props
 * @param {(color: string) => void} props.setBodyTexture Body color setter.
 * @returns {JSX.Element}
 */
export function BodyTexturePicker({ setBodyBg, isPremium, onPremiumRequired, onPremiumDismissed }) {
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
      const idx = Math.floor(pointerAngle / segmentAngle) % TORSO_COLORS.length
      return { color: TORSO_COLORS[idx], idx }
    },
    [normalizeAngle, segmentAngle]
  )

  const applyColorForRotation = useCallback(
    (rotationValue) => {
      const { color, idx } = getColorForRotation(rotationValue)
      setSelectedColor(color)
      setBodyBg(color.name)
      onPremiumDismissed?.()
    },
    [getColorForRotation, setBodyBg]
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
      {Object.entries(bodyTextureAssets).filter(([name]) => !/^[^_]+_\d$/.test(name)).length > 0 && (
        <div className={styles['texture-grid']}>
          {Object.entries(bodyTextureAssets).filter(([name]) => !/^[^_]+_\d$/.test(name)).map(([name, url]) => (
            <div
              key={name}
              className={styles['texture-cell']}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => { setBodyBg(name); if (!isPremium) onPremiumRequired(); }}
            >
              {!isPremium && <LuLock className={styles['texture-padlock']} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TUTORIAL_MESSAGES = [
  "Welcome to the Pickbot editor! :)",
  "Click on the eyes category",
  "Add one to your pickbot",
  "Check out the mouths",
  "Choose an accessory and drag it",
  "Change your body color",
  "Change your body form",
  "Don't forget to save!"
]

