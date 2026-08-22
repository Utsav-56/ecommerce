'use server'
import prisma from '@/lib/prisma'
import { requireUser, actionSuccess, actionError } from '@/lib/actions/utils'
import { serializeProduct } from '@/lib/domain/serializers/product'

export async function getPurchasesAction() {
  try {
    const session = await requireUser()

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
      product: serializeProduct(purchase.product)
    }))

    return actionSuccess({ list: formatted })
  } catch (error) {
    console.error('Get purchases action error:', error)
    return actionError('Failed to fetch purchase history.')
  }
}

export async function recordPurchaseAction(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      return actionError('Order not found.')
    }

    const purchases = []
    for (const item of order.orderItems) {
      const existingPurchase = await prisma.purchase.findUnique({
        where: {
          orderId_productId: {
            orderId: order.id,
            productId: item.productId
          }
        }
      })

      if (!existingPurchase) {
        const purchase = await prisma.purchase.create({
          data: {
            userId: order.userId,
            productId: item.productId,
            orderId: order.id,
            quantity: item.quantity,
            pricePaid: item.price,
            paymentMethod: order.paymentMethod
          }
        })
        purchases.push(purchase)
      } else {
        purchases.push(existingPurchase)
      }
    }

    return actionSuccess({ list: purchases })
  } catch (error) {
    console.error('Record purchase error:', error)
    return actionError('Failed to record purchases.')
  }
}
