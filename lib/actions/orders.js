'use server'
import prisma from '@/lib/prisma'
import { requireUser, requireAdmin, actionSuccess, actionError } from '@/lib/actions/utils'
import { initiateEsewaPayment } from '@/lib/domain/payments/esewa'
import { initiateKhaltiPayment } from '@/lib/domain/payments/khalti'
import { recordPaymentResult } from '@/lib/domain/payments/resultHandler'
import { serializeOrder } from '@/lib/domain/serializers/order'
import { isAllowedPaymentMethod, PAYMENT_METHODS } from '@/lib/constants/payment'
import { isAllowedOrderStatus } from '@/lib/constants/order'
import { validateCartQuantity } from '@/lib/domain/validation'

export async function placeOrderAction({ addressId, paymentMethod, cartItems }) {
  try {
    const session = await requireUser()

    if (!addressId || !paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0) {
      return actionError('Missing order details.')
    }

    if (!isAllowedPaymentMethod(paymentMethod)) {
      return actionError('Invalid payment method selected.')
    }

    // Verify shipping address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.userId }
    })
    if (!address) return actionError('Invalid shipping address.')

    // Batch query products to prevent N+1 queries
    const productIds = cartItems.map(item => item.productId).filter(Boolean)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    let calculatedTotal = 0
    const verifiedItems = []

    for (const item of cartItems) {
      const qtyValidation = validateCartQuantity(item.quantity)
      if (!qtyValidation.valid) {
        return actionError(`Invalid quantity for product ${item.productId}`)
      }
      const qty = qtyValidation.value

      const product = productMap.get(item.productId)
      if (!product) {
        return actionError(`Product not found: ${item.productId}`)
      }
      if (!product.inStock) {
        return actionError(`Product is out of stock: ${product.name}`)
      }

      calculatedTotal += product.price * qty
      verifiedItems.push({
        productId: product.id,
        quantity: qty,
        price: product.price,
        name: product.name
      })
    }

    // Perform atomic order creation and initial payment record
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.userId,
          total: calculatedTotal,
          status: paymentMethod === PAYMENT_METHODS.COD ? 'ORDER_PLACED' : 'PENDING_PAYMENT',
          addressId,
          isPaid: false,
          paymentMethod
        }
      })

      for (const item of verifiedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })

        await tx.product.update({
          where: { id: item.productId },
          data: { salesCount: { increment: item.quantity } }
        })

        if (paymentMethod === PAYMENT_METHODS.COD) {
          await tx.purchase.create({
            data: {
              userId: session.userId,
              productId: item.productId,
              orderId: order.id,
              quantity: item.quantity,
              pricePaid: item.price,
              paymentMethod: PAYMENT_METHODS.COD
            }
          })
        }
      }

      await tx.cartItem.deleteMany({
        where: { userId: session.userId }
      })

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: calculatedTotal,
          status: paymentMethod === PAYMENT_METHODS.COD ? 'SUCCESS' : 'PENDING',
          paymentMethod
        }
      })

      return { order, payment }
    })

    let redirectUrl = ''
    if (paymentMethod === PAYMENT_METHODS.COD) {
      redirectUrl = '/profile'
    } else if (paymentMethod === PAYMENT_METHODS.ESEWA) {
      redirectUrl = initiateEsewaPayment({
        orderId: result.order.id,
        totalAmount: calculatedTotal
      })
    } else if (paymentMethod === PAYMENT_METHODS.KHALTI) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
        const productName = verifiedItems.map(i => i.name).join(', ')

        const khaltiResult = await initiateKhaltiPayment({
          orderId: result.order.id,
          totalAmount: calculatedTotal,
          productName,
          customerName: dbUser?.name,
          customerEmail: dbUser?.email
        })

        redirectUrl = khaltiResult.paymentUrl
        await prisma.payment.update({
          where: { id: result.payment.id },
          data: { transactionId: khaltiResult.pidx }
        })
      } catch (err) {
        console.error('Khalti initiate error:', err)
        return actionSuccess({
          order: serializeOrder(result.order),
          redirectUrl: '',
          warning: 'Order placed, but payment initiation failed. You can retry from My Orders.'
        })
      }
    }

    return actionSuccess({ order: serializeOrder(result.order), redirectUrl })
  } catch (error) {
    console.error('Place order action error:', error)
    return actionError(error)
  }
}

export async function getOrdersAction() {
  try {
    const session = await requireUser()

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        address: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return actionSuccess({ orders: orders.map(serializeOrder) })
  } catch (error) {
    console.error('Get orders action error:', error)
    return actionSuccess({ orders: [] })
  }
}

export async function getAllOrdersAction() {
  try {
    await requireAdmin()

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        address: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return actionSuccess({ orders: orders.map(serializeOrder) })
  } catch (error) {
    console.error('Get all orders action error:', error)
    return actionError(error)
  }
}

export async function updateOrderStatusAction(orderId, status) {
  try {
    await requireAdmin()

    if (!isAllowedOrderStatus(status)) {
      return actionError(`Invalid order status: '${status}'`)
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return actionSuccess({ order: serializeOrder(updated) })
  } catch (error) {
    console.error('Update order status action error:', error)
    return actionError(error)
  }
}

export async function completeOrderPaymentAction({ orderId, paymentMethod }) {
  try {
    if (!isAllowedPaymentMethod(paymentMethod)) {
      return actionError('Invalid payment method.')
    }

    const res = await recordPaymentResult({
      gateway: paymentMethod,
      orderId,
      status: 'SUCCESS',
      payload: { directCompletion: true }
    })

    return actionSuccess({ isPaid: res.isPaid })
  } catch (error) {
    console.error('Complete order payment action error:', error)
    return actionError(error)
  }
}

export async function retryPaymentAction(orderId) {
  try {
    const session = await requireUser()

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.userId }
    })
    if (!order) return actionError('Order not found.')
    if (order.status !== 'PENDING_PAYMENT') return actionError('Order is not pending payment.')

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id }
    })
    if (!payment) return actionError('Payment record not found.')

    let redirectUrl = ''
    if (order.paymentMethod === PAYMENT_METHODS.ESEWA) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      redirectUrl = initiateEsewaPayment({
        orderId: order.id,
        totalAmount: order.total,
        failureUrl: `${appUrl}/orders`
      })
    } else if (order.paymentMethod === PAYMENT_METHODS.KHALTI) {
      const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id }, include: { product: true } })
      const productName = orderItems.map(i => i.product.name).join(', ')

      const khaltiResult = await initiateKhaltiPayment({
        orderId: order.id,
        totalAmount: order.total,
        productName,
        customerName: dbUser?.name,
        customerEmail: dbUser?.email
      })

      redirectUrl = khaltiResult.paymentUrl
      await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: khaltiResult.pidx }
      })
    } else {
      return actionError('Unsupported payment method for retry.')
    }

    return actionSuccess({ redirectUrl })
  } catch (error) {
    console.error('Retry payment action error:', error)
    return actionError(error)
  }
}
