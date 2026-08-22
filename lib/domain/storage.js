import fs from 'fs/promises'
import path from 'path'

export async function saveProductImage(file, index) {
  if (!file || file.size <= 0 || !file.name) return null

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileExt = path.extname(file.name)
  const sanitizedBase = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `${Date.now()}-${index}-${sanitizedBase}${fileExt}`

  const uploadDir = path.join(process.cwd(), 'public/products')
  await fs.mkdir(uploadDir, { recursive: true })
  const fullPath = path.join(uploadDir, filename)
  await fs.writeFile(fullPath, buffer)

  return `/products/${filename}`
}

export async function deleteProductImages(imagePaths = []) {
  if (!Array.isArray(imagePaths)) return
  for (const filePath of imagePaths) {
    if (!filePath || typeof filePath !== 'string') continue
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath)
      await fs.unlink(fullPath)
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }
}
