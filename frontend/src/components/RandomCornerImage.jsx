import { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import bmoDance from '../assets/funsies/bmo_dance.gif'
import bubblegum from '../assets/funsies/bubblegum.png'
import jake from '../assets/funsies/jake.png'
import treetrunks from '../assets/funsies/treetrunks.png'
import finn from '../assets/funsies/finn.png'
import styles from './RandomCornerImage.module.css'

const IMAGES = [bmoDance, bubblegum, jake, treetrunks, finn]

export default function RandomCornerImage() {
  const [src] = useState(() => IMAGES[Math.floor(Math.random() * IMAGES.length)])
  const nodeRef = useRef(null)
  return (
    <div className={styles['drag-root']}>
      <Draggable nodeRef={nodeRef} defaultPosition={{ x: window.innerWidth - 184, y: window.innerHeight - 320 }}>
        <img ref={nodeRef} src={src} alt="" className={styles['corner-image']} draggable={false} />
      </Draggable>
    </div>
  )
}
