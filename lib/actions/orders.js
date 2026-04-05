'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function placeOrderAction({ total, addressId, paymentMethod, couponCode, couponDiscount, cartItems }) {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'User not logged in.' }

    if (!addressId || !paymentMethod || !cartItems || cartItems.length === 0) {
      return { success: false, error: 'Missing order details.' }
    }

    // Double check address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.userId }
    })
    if (!address) return { success: false, error: 'Invalid shipping address.' }

    // Start a transaction to ensure atomic execution
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          userId: session.userId,
          total,
          status: 'ORDER_PLACED',
          addressId,
          isPaid: false,
          paymentMethod,
          isCouponUsed: !!couponCode,
          couponCode: couponCode || '',
          couponDiscount: couponDiscount || 0
        }
      })

      // 2. Create the OrderItems & Increment Product salesCount
      for (const item of cartItems) {
        // Fetch product to verify price/existence
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`)
        }

        // Create OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          }
        })

        // Increment salesCount
        await tx.product.update({
          where: { id: item.productId },
          data: { salesCount: { increment: item.quantity } }
        })
      }

      // 3. Clear the user's cart in the database
      await tx.cartItem.deleteMany({
        where: { userId: session.userId }
      })

      // 4. Handle Payments table initialization
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          status: 'PENDING',
          paymentMethod
        }
      })

      return { order, payment }
    })

    if (paymentMethod === 'STRIPE') {
      return { 
        success: true, 
        order: result.order, 
        redirectUrl: `/checkout/stripe?orderId=${result.order.id}&paymentId=${result.payment.id}` 
      }
    }

    // COD order placed successfully
    return { success: true, order: result.order }
  } catch (error) {
    console.error('Place order action error:', error)
    return { success: false, error: error.message || 'Failed to place order.' }
  }
}

export async function getOrdersAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: true, orders: [] }

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

    // Format products images array
    const formatted = orders.map(order => ({
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? item.product.images.split(',') : []
        }
      }))
    }))

    return { success: true, orders: formatted }
  } catch (error) {
    console.error('Get orders action error:', error)
    return { success: false, orders: [] }
  }
}

export async function getAllOrdersAction() {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

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

    // Format product images
    const formatted = orders.map(order => ({
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? item.product.images.split(',') : []
        }
      }))
    }))

    return { success: true, orders: formatted }
  } catch (error) {
    console.error('Get all orders action error:', error)
    return { success: false, error: 'Failed to fetch orders.' }
  }
}

export async function updateOrderStatusAction(orderId, status) {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return { success: true, order: updated }
  } catch (error) {
    console.error('Update order status action error:', error)
    return { success: false, error: 'Failed to update order status.' }
  }
}

export async function validateCouponAction(code) {
  try {
    if (!code) return { success: false, error: 'Coupon code is required.' }
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })
    if (!coupon) {
      return { success: false, error: 'Coupon not found.' }
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: 'Coupon has expired.' }
    }
    return {
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount: coupon.discount
      }
    }
  } catch (error) {
    console.error('Validate coupon action error:', error)
    return { success: false, error: 'Failed to validate coupon.' }
  }
}
