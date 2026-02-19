const eyeGlobs = import.meta.glob('./assets/DressingRoom/Dressing/Eyes/*.png', { eager: true, import: 'default' })
const mouthGlobs = import.meta.glob('./assets/DressingRoom/Dressing/Mouths/*.png', { eager: true, import: 'default' })
const accessoryGlobs = import.meta.glob('./assets/DressingRoom/Dressing/Accessories/*.png', { eager: true, import: 'default' })

function buildAssetMap(globs) {
  const map = {}
  for (const [path, url] of Object.entries(globs)) {
    const name = path.split('/').pop().replace('.png', '')
    map[name] = url
  }
  return map
}

export const eyeAssets = buildAssetMap(eyeGlobs)
export const mouthAssets = buildAssetMap(mouthGlobs)
export const accessoryAssets = buildAssetMap(accessoryGlobs)

export const assetRegistry = { eye: eyeAssets, mouth: mouthAssets, accessory: accessoryAssets }
