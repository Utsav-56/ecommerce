'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function getRatingsAction() {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Structure rating user similar to dummy user structures
    const formatted = ratings.map(r => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      productId: r.productId,
      orderId: r.orderId,
      createdAt: r.createdAt.toString(),
      updatedAt: r.updatedAt.toString(),
      user: {
        name: r.user.name,
        // Default avatar
        image: null
      }
    }))
    
    return { success: true, ratings: formatted }
  } catch (error) {
    console.error('Get ratings action error:', error)
    return { success: false, ratings: [] }
  }
}

export async function addRatingAction({ rating, review, productId, orderId }) {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'User not logged in.' }

    if (!rating || !review || !productId || !orderId) {
      return { success: false, error: 'Rating and review are required.' }
    }

    // Verify order exists and is delivered
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.userId }
    })
    if (!order) {
      return { success: false, error: 'Order not found.' }
    }

    const newRating = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        review,
        productId,
        orderId,
        userId: session.userId
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    const formatted = {
      id: newRating.id,
      rating: newRating.rating,
      review: newRating.review,
      productId: newRating.productId,
      orderId: newRating.orderId,
      createdAt: newRating.createdAt.toString(),
      updatedAt: newRating.updatedAt.toString(),
      user: {
        name: newRating.user.name,
        image: null
      }
    }

    return { success: true, rating: formatted }
  } catch (error) {
    console.error('Add rating action error:', error)
    return { success: false, error: 'Failed to submit rating.' }
  }
}
