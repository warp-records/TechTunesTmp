const avatars = import.meta.glob('../assets/Avatar/Avatar[0-9].png', { eager: true, import: 'default' })

export const avatarList = Object.values(avatars)

export const TORSO_COLORS = [
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

const WHITE_IDX = 3

// bodyBg: { isTexture: bool, colorIdx?: number, bgSrc?: string }
export function resolveBodyBg(bodyBg) {
  if (!bodyBg) return TORSO_COLORS[WHITE_IDX].gradient
  if (bodyBg.isTexture) return bodyBg.bgSrc
  return TORSO_COLORS[bodyBg.colorIdx]?.gradient ?? TORSO_COLORS[WHITE_IDX].gradient
}

export function serializeAvatar({ form, bodyBg, activeItems }) {
  return JSON.stringify({ form, bodyBg, activeItems })
}

export function deserializeAvatar(json) {
  return JSON.parse(json)
}
