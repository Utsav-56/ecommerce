export const ELECTRONICS_CATEGORIES = [
  'Audio',
  'Computers',
  'Mobile Devices',
  'Cameras',
  'Wearables',
  'Accessories',
]

export function normalizeElectronicsCategory(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  const found = ELECTRONICS_CATEGORIES.find(
    cat => cat.toLowerCase() === trimmed.toLowerCase()
  )
  return found || null
}

export function isElectronicsCategory(value) {
  return normalizeElectronicsCategory(value) !== null
}

export function serializeImages(images) {
  if (!Array.isArray(images)) return ''
  return images.filter(Boolean).join(',')
}

export function parseImages(imagesStr) {
  if (!imagesStr || typeof imagesStr !== 'string') return []
  return imagesStr.split(',').map(s => s.trim()).filter(Boolean)
}
