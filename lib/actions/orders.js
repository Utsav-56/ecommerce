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
          status: paymentMethod === 'COD' ? 'ORDER_PLACED' : 'PENDING_PAYMENT',
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

        // If COD, write directly to Purchase table
        if (paymentMethod === 'COD') {
          await tx.purchase.create({
            data: {
              userId: session.userId,
              productId: item.productId,
              quantity: item.quantity,
              pricePaid: product.price,
              paymentMethod: 'COD'
            }
          })
        }
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
          status: paymentMethod === 'COD' ? 'SUCCESS' : 'PENDING',
          paymentMethod
        }
      })

      return { order, payment }
    })

    let redirectUrl = ''
    if (paymentMethod === 'COD') {
      redirectUrl = '/profile'
    } else if (paymentMethod === 'ESEWA') {
      const crypto = require('crypto')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const transaction_uuid = result.order.id
      const product_code = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
      const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
      const message = `total_amount=${total},transaction_uuid=${transaction_uuid},product_code=${product_code}`
      const hash = crypto.createHmac('sha256', secret).update(message).digest('base64')
      
      const esewaPayload = {
        amount: total,
        tax_amount: 0,
        total_amount: total,
        transaction_uuid: transaction_uuid,
        product_code: product_code,
        product_delivery_charge: 0,
        product_service_charge: 0,
        success_url: `${appUrl}/api/payments/esewa/success`,
        failure_url: `${appUrl}/checkout`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: hash
      }
      
      const queryParams = new URLSearchParams()
      for (const [key, value] of Object.entries(esewaPayload)) {
          queryParams.append(key, value)
      }
      redirectUrl = `/checkout/esewa?${queryParams.toString()}`

    } else if (paymentMethod === 'KHALTI') {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        
        // Khalti requires 'Key <your_test_secret_key>' format
        let khaltiSecret = process.env.KHALTI_SECRET_KEY || 'test_secret_key_8b9919f9f9d74b93a3840b15e34fb703'
        if (!khaltiSecret.startsWith('Key ')) {
            khaltiSecret = `Key ${khaltiSecret}`
        }

        const khaltiResponse = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
          method: 'POST',
          headers: {
            'Authorization': khaltiSecret,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            return_url: `${appUrl}/api/payments/khalti/success`,
            website_url: appUrl,
            amount: Math.round(total * 100), // Khalti expects paisa
            purchase_order_id: result.order.id,
            purchase_order_name: `Order #${result.order.id.substring(0, 8)}`,
            customer_info: {
              name: dbUser?.name || 'Customer',
              email: dbUser?.email || 'customer@example.com',
              phone: '9800000000'
            }
          })
        })
        const khaltiData = await khaltiResponse.json()
        
        if (khaltiResponse.ok) {
          if (khaltiData.payment_url) {
            redirectUrl = khaltiData.payment_url
            // Update payment transaction ID with pidx
            await prisma.payment.update({
              where: { id: result.payment.id },
              data: { transactionId: khaltiData.pidx }
            })
          } else {
            throw new Error('Khalti initiate failed: no payment_url returned')
          }
        } else {
            console.error('Khalti Error Payload:', khaltiData)
            throw new Error(khaltiData.detail || `Khalti failed: ${JSON.stringify(khaltiData)}`)
        }
      } catch (err) {
        console.error('Khalti initiate error:', err)
        return { success: false, error: err.message || 'Failed to initiate Khalti payment.' }
      }
    } else {
      return { success: false, error: 'Invalid payment method selected.' }
    }

    return { success: true, order: result.order, redirectUrl }
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
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      address: {
        ...order.address,
        createdAt: order.address.createdAt.toISOString()
      },
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
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
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      address: {
        ...order.address,
        createdAt: order.address.createdAt.toISOString()
      },
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
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

export async function completeOrderPaymentAction({ orderId, paymentMethod }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } }
    })
    if (!order) return { success: false, error: 'Order not found.' }

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id }
    })

    await prisma.$transaction(async (tx) => {
      // 1. Update Order
      await tx.order.update({
        where: { id: orderId },
        data: { isPaid: true, status: 'PROCESSING' }
      })

      // 2. Update Payment
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', paymentMethod }
        })
      }

      // 3. Write to Purchase table
      for (const item of order.orderItems) {
        // Skip if purchase already exists (to avoid duplicate webhook invocations)
        const existingPurchase = await tx.purchase.findFirst({
          where: {
            userId: order.userId,
            productId: item.productId,
            createdAt: {
              gte: new Date(Date.now() - 5000) // check last 5 seconds
            }
          }
        })
        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: order.userId,
              productId: item.productId,
              quantity: item.quantity,
              pricePaid: item.price,
              paymentMethod
            }
          })
        }
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Complete order payment action error:', error)
    return { success: false, error: 'Failed to record payment.' }
  }
}

export async function retryPaymentAction(orderId) {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'Unauthorized.' }

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.userId }
    })
    if (!order) return { success: false, error: 'Order not found.' }
    if (order.status !== 'PENDING_PAYMENT') return { success: false, error: 'Order is not pending payment.' }

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id }
    })
    if (!payment) return { success: false, error: 'Payment record not found.' }

    let redirectUrl = ''
    if (order.paymentMethod === 'ESEWA') {
      const crypto = require('crypto')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const transaction_uuid = order.id
      const product_code = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
      const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
      const message = `total_amount=${order.total},transaction_uuid=${transaction_uuid},product_code=${product_code}`
      const hash = crypto.createHmac('sha256', secret).update(message).digest('base64')

      const esewaPayload = {
        amount: order.total,
        tax_amount: 0,
        total_amount: order.total,
        transaction_uuid: transaction_uuid,
        product_code: product_code,
        product_delivery_charge: 0,
        product_service_charge: 0,
        success_url: `${appUrl}/api/payments/esewa/success`,
        failure_url: `${appUrl}/orders`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: hash
      }

      const queryParams = new URLSearchParams()
      for (const [key, value] of Object.entries(esewaPayload)) {
          queryParams.append(key, value)
      }
      redirectUrl = `/checkout/esewa?${queryParams.toString()}`

    } else if (order.paymentMethod === 'KHALTI') {
      const dbUser = await prisma.user.findUnique({ where: { id: session.userId } })
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      let khaltiSecret = process.env.KHALTI_SECRET_KEY || 'test_secret_key_8b9919f9f9d74b93a3840b15e34fb703'
      if (!khaltiSecret.startsWith('Key ')) {
          khaltiSecret = `Key ${khaltiSecret}`
      }

      const khaltiResponse = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
        method: 'POST',
        headers: {
          'Authorization': khaltiSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          return_url: `${appUrl}/api/payments/khalti/success`,
          website_url: appUrl,
          amount: Math.round(order.total * 100),
          purchase_order_id: order.id,
          purchase_order_name: `Order #${order.id.substring(0, 8)}`,
          customer_info: {
            name: dbUser?.name || 'Customer',
            email: dbUser?.email || 'customer@example.com',
            phone: '9800000000'
          }
        })
      })
      const khaltiData = await khaltiResponse.json()
      
      if (khaltiResponse.ok && khaltiData.payment_url) {
        redirectUrl = khaltiData.payment_url
        await prisma.payment.update({
          where: { id: payment.id },
          data: { transactionId: khaltiData.pidx }
        })
      } else {
        console.error('Khalti Error Payload:', khaltiData)
        return { success: false, error: khaltiData.detail || 'Khalti initiate failed' }
      }
    } else {
      return { success: false, error: 'Unsupported payment method.' }
    }

    return { success: true, redirectUrl }
  } catch (error) {
    console.error('Retry payment action error:', error)
    return { success: false, error: 'Failed to initiate payment retry.' }
  }
}
