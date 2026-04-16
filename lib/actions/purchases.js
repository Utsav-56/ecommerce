'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function getPurchasesAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'Unauthorized.' }

    const purchases = await prisma.purchase.findMany({
      where: { userId: session.userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = purchases.map(purchase => ({
      ...purchase,
      createdAt: purchase.createdAt.toISOString(),
      product: {
        ...purchase.product,
        createdAt: purchase.product.createdAt.toISOString(),
        updatedAt: purchase.product.updatedAt.toISOString(),
        images: purchase.product.images ? purchase.product.images.split(',') : []
      }
    }))

    return { success: true, list: formatted }
  } catch (error) {
    console.error('Get purchases action error:', error)
    return { success: false, error: 'Failed to fetch purchase history.' }
  }
}

export async function recordPurchaseAction(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      return { success: false, error: 'Order not found.' }
    }

    const purchases = []
    for (const item of order.orderItems) {
      const purchase = await prisma.purchase.create({
        data: {
          userId: order.userId,
          productId: item.productId,
          quantity: item.quantity,
          pricePaid: item.price,
          paymentMethod: order.paymentMethod
        }
      })
      purchases.push(purchase)
    }

    return { success: true, list: purchases }
  } catch (error) {
    console.error('Record purchase error:', error)
    return { success: false, error: 'Failed to record purchases.' }
  }
}
