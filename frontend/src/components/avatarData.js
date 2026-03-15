const avatars = import.meta.glob('../assets/Avatar/Avatar[0-9].png', { eager: true, import: 'default' })

export const avatarList = Object.values(avatars)

export function serializeAvatar({ form, bodyTexture, activeItems }) {
  return JSON.stringify({ form, bodyTexture, activeItems })
}

export function deserializeAvatar(json) {
  return JSON.parse(json)
}
