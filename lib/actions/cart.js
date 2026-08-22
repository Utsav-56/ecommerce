'use server'
import prisma from '@/lib/prisma'
import { requireUser, actionSuccess, actionError } from '@/lib/actions/utils'

export async function getCartAction() {
  try {
    const session = await requireUser()

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId }
    })

    const cartItems = {}
    let total = 0

    items.forEach(item => {
      cartItems[item.productId] = item.quantity
      total += item.quantity
    })

    return actionSuccess({ cartItems, total })
  } catch (error) {
    console.error('Get cart action error:', error)
    return actionSuccess({ cartItems: {}, total: 0 })
  }
}

export async function updateCartItemAction({ productId, quantity }) {
  try {
    const session = await requireUser()

    if (!productId || typeof productId !== 'string') {
      return actionError('Product ID is required.')
    }

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || !Number.isFinite(qty)) {
      return actionError('Quantity must be an integer.')
    }

    if (qty <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.userId,
          productId
        }
      })
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return actionError('Product does not exist.')
      }

      await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: session.userId,
            productId
          }
        },
        update: { quantity: qty },
        create: {
          userId: session.userId,
          productId,
          quantity: qty
        }
      })
    }

    return actionSuccess()
  } catch (error) {
    console.error('Update cart item action error:', error)
    return actionError(error)
  }
}

export async function clearCartAction() {
  try {
    const session = await requireUser()

    await prisma.cartItem.deleteMany({
      where: { userId: session.userId }
    })

    return actionSuccess()
  } catch (error) {
    console.error('Clear cart action error:', error)
    return actionSuccess()
  }
}
