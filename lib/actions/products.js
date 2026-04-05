'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import fs from 'fs/promises'
import path from 'path'

export async function getProductsAction() {
  try {
    const products = await prisma.product.findMany({
      include: { ratings: true },
      orderBy: { createdAt: 'desc' }
    })
    
    const formatted = products.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : [],
      rating: product.ratings || []
    }))
    
    return { success: true, products: formatted }
  } catch (error) {
    console.error('Get products action error:', error)
    return { success: false, products: [] }
  }
}

export async function addProductAction(formData) {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const name = formData.get('name')
    const description = formData.get('description')
    const mrp = parseFloat(formData.get('mrp'))
    const price = parseFloat(formData.get('price'))
    const category = formData.get('category')

    if (!name || !description || isNaN(mrp) || isNaN(price) || !category) {
      return { success: false, error: 'All fields are required.' }
    }

    const images = []
    
    // Loop through 4 potential images
    for (let i = 1; i <= 4; i++) {
      const file = formData.get(`image${i}`)
      if (file && file.size > 0 && file.name) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Sanitize file name
        const fileExt = path.extname(file.name)
        const sanitizedBase = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9]/g, '_')
        const filename = `${Date.now()}-${i}-${sanitizedBase}${fileExt}`
        
        const uploadDir = path.join(process.cwd(), 'public/products')
        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(path.join(uploadDir, filename), buffer)
        
        images.push(`/products/${filename}`)
      }
    }

    if (images.length === 0) {
      return { success: false, error: 'At least one product image is required.' }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: images.join(','),
        inStock: true
      }
    })

    return { 
      success: true, 
      product: { ...product, images } 
    }
  } catch (error) {
    console.error('Add product action error:', error)
    return { success: false, error: 'Failed to add product.' }
  }
}

export async function toggleStockAction(productId) {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { success: false, error: 'Product not found.' }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock }
    })

    return { 
      success: true, 
      product: { ...updated, images: updated.images.split(',') } 
    }
  } catch (error) {
    console.error('Toggle stock action error:', error)
    return { success: false, error: 'Failed to update stock.' }
  }
}

export async function deleteProductAction(productId) {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { success: false, error: 'Product not found.' }

    // Optional: Delete physical files from public/products/
    const filePaths = product.images ? product.images.split(',') : []
    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePath)
        await fs.unlink(fullPath)
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }

    await prisma.product.delete({ where: { id: productId } })
    return { success: true }
  } catch (error) {
    console.error('Delete product action error:', error)
    return { success: false, error: 'Failed to delete product.' }
  }
}
