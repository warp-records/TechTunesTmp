
import './Create.css'
import eyesBtn from '../../assets/DressingRoom/Accessory/Eyes Button.png'
import mouthBtn from '../../assets/DressingRoom/Accessory/Mouth Button.png'
import accessoryBtn from '../../assets/DressingRoom/Accessory/AccessoryButton.png'
import bodyBtn from '../../assets/DressingRoom/Accessory/Body Button.png'
import avatar1 from '../../assets/Avatar/Avatar1.png'

export default function Create() {
  return (
    <>
    
      <div className="button-row">
          <div className="button-icon" style={{backgroundImage: `url(${eyesBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${mouthBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${accessoryBtn})`}}></div>
          <div className="button-icon" style={{backgroundImage: `url(${bodyBtn})`}}></div>
      </div>
      <div class="choice-frame"></div>
      <div class="mirror"></div>
      <div class="light"></div>
      <div class="stand"></div>
      <div class="arrow-back"></div>
      <div class="arrow-forward"></div>
      <div class="avatar-container">
        <Avatar/>
        <div class="avatar-slider">
        </div>
      </div>
      
      <div class="floor"></div>
    </>
  )
}


// variant is 0, 1, 2, 3, or 4
export function Avatar({ variant, color, eyes, mouth, accessory }) {
  return (
  <div class="avatar-image">
      <div class="body-image" style={{backgroundImage: `url(${avatar1})`}}></div>
      <div class="body-color-layer"></div>
      <div class="avatar-eyes"></div>
      <div class="avatar-mouth"></div>
      <div class="avatar-accessory"></div>
  </div>
  )
}