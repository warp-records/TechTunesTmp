const avatars = import.meta.glob('../assets/Avatar/Avatar[0-9].png', { eager: true, import: 'default' })

export const avatarList = Object.values(avatars)

// plain skins are free; anything else requires premium
export const PLAIN_SKINS = new Set(['yellow', 'purple', 'white', 'red', 'green', 'blue', 'orange', 'pink'])

export const DEFAULT_SKIN = 'white'

// colors used by the wheel UI — hex/glowClass only, no gradient needed
export const TORSO_COLORS = [
  { name: 'yellow', hex: '#FACF43', glowClass: 'glow-yellow' },
  { name: 'purple', hex: '#6924CF', glowClass: 'glow-purple' },
  { name: 'white',  hex: '#FFFFFF', glowClass: 'glow-white' },
  { name: 'red',    hex: '#EE0940', glowClass: 'glow-red' },
  { name: 'green',  hex: '#32CD32', glowClass: 'glow-green' },
  { name: 'blue',   hex: '#1353C1', glowClass: 'glow-blue' },
  { name: 'orange', hex: '#FF8C00', glowClass: 'glow-orange' },
  { name: 'pink',   hex: '#DF4078', glowClass: 'glow-pink' },
]

export function isPremiumSkin(skinName) {
  return !PLAIN_SKINS.has(skinName)
}

// bodyBg is now just a skin name string
export function resolveBodyBg(skinName) {
  return skinName || DEFAULT_SKIN
}

export function serializeAvatar({ form, bodyBg, activeItems }) {
  return JSON.stringify({ form, bodyBg, activeItems })
}

export function deserializeAvatar(json) {
  return JSON.parse(json)
}
