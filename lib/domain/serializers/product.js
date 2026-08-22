import { parseImages } from "@/lib/constants/categories"

export function serializeProduct(product) {
  if (!product) return null
  return {
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
    images: parseImages(product.images),
    rating: (product.ratings || []).map(r => ({
      ...r,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString()
    }))
  }
}
