'use server'
import prisma from '@/lib/prisma'
import { requireAdmin, actionSuccess, actionError } from '@/lib/actions/utils'
import { normalizeElectronicsCategory, serializeImages } from '@/lib/constants/categories'
import { serializeProduct } from '@/lib/domain/serializers/product'
import { saveProductImage, deleteProductImages } from '@/lib/domain/storage'

export async function getProductsAction() {
  try {
    const products = await prisma.product.findMany({
      include: { ratings: true },
      orderBy: { createdAt: 'desc' }
    })

    return actionSuccess({ products: products.map(serializeProduct) })
  } catch (error) {
    console.error('Get products action error:', error)
    return actionSuccess({ products: [] })
  }
}

export async function addProductAction(formData) {
  try {
    await requireAdmin()

    const name = formData.get('name')
    const description = formData.get('description')
    const mrp = parseFloat(formData.get('mrp'))
    const price = parseFloat(formData.get('price'))
    const rawCategory = formData.get('category')

    if (!name || !description || isNaN(mrp) || isNaN(price) || !rawCategory) {
      return actionError('All fields are required.')
    }

    const canonicalCategory = normalizeElectronicsCategory(rawCategory)
    if (!canonicalCategory) {
      return actionError('Invalid electronics category.')
    }

    const images = []
    for (let i = 1; i <= 4; i++) {
      const file = formData.get(`image${i}`)
      const savedPath = await saveProductImage(file, i)
      if (savedPath) {
        images.push(savedPath)
      }
    }

    if (images.length === 0) {
      return actionError('At least one product image is required.')
    }

    let product
    try {
      product = await prisma.product.create({
        data: {
          name: name.toString().trim(),
          description: description.toString().trim(),
          mrp,
          price,
          category: canonicalCategory,
          images: serializeImages(images),
          inStock: true
        }
      })
    } catch (dbErr) {
      // Clean up newly uploaded files if DB write failed
      await deleteProductImages(images)
      throw dbErr
    }

    return actionSuccess({ product: serializeProduct(product) })
  } catch (error) {
    console.error('Add product action error:', error)
    return actionError(error)
  }
}

export async function toggleStockAction(productId) {
  try {
    await requireAdmin()

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return actionError('Product not found.')

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock }
    })

    return actionSuccess({ product: serializeProduct(updated) })
  } catch (error) {
    console.error('Toggle stock action error:', error)
    return actionError(error)
  }
}

export async function deleteProductAction(productId) {
  try {
    await requireAdmin()

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return actionError('Product not found.')

    const serialized = serializeProduct(product)
    if (serialized.images && serialized.images.length > 0) {
      await deleteProductImages(serialized.images)
    }

    await prisma.product.delete({ where: { id: productId } })
    return actionSuccess()
  } catch (error) {
    console.error('Delete product action error:', error)
    return actionError(error)
  }
}
