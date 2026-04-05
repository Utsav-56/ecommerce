'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function getCartAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: true, cartItems: {}, total: 0 }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId }
    })

    const cartItems = {}
    let total = 0
    
    items.forEach(item => {
      cartItems[item.productId] = item.quantity
      total += item.quantity
    })

    return { success: true, cartItems, total }
  } catch (error) {
    console.error('Get cart action error:', error)
    return { success: false, cartItems: {}, total: 0 }
  }
}

export async function updateCartItemAction({ productId, quantity }) {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'User not logged in.' }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.userId,
          productId
        }
      })
    } else {
      await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: session.userId,
            productId
          }
        },
        update: { quantity },
        create: {
          userId: session.userId,
          productId,
          quantity
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Update cart item action error:', error)
    return { success: false, error: 'Failed to update cart.' }
  }
}

export async function clearCartAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false }

    await prisma.cartItem.deleteMany({
      where: { userId: session.userId }
    })

    return { success: true }
  } catch (error) {
    console.error('Clear cart action error:', error)
    return { success: false }
  }
}
