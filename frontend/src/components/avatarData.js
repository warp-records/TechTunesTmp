const avatars = import.meta.glob('../assets/Avatar/Avatar[0-9].png', { eager: true, import: 'default' })

/**
 * Ordered list of available avatar base assets.
 *
 * @type {string[]}
 */
export const avatarList = Object.values(avatars)

/**
 * Serializes avatar state for storage.
 *
 * @param {{form: number, bodyColor?: string, activeItems?: Record<string, unknown>}} data
 * @returns {string}
 */
export function serializeAvatar({ form, bodyColor, activeItems }) {
  return JSON.stringify({ form, bodyColor, activeItems })
}

/**
 * Deserializes avatar JSON payload from storage.
 *
 * @param {string} json
 * @returns {{form: number, bodyColor?: string, activeItems?: Record<string, unknown>}}
 */
export function deserializeAvatar(json) {
  return JSON.parse(json)
}
