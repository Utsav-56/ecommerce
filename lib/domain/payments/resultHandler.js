import prisma from "@/lib/prisma"

export async function recordPaymentResult({ gateway, orderId, paymentId, status, payload, transactionId }) {
  if (!orderId) {
    throw new Error('Order ID is required to record payment result.')
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true }
  })
  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  const payment = paymentId
    ? await prisma.payment.findUnique({ where: { id: paymentId } })
    : await prisma.payment.findFirst({ where: { orderId: order.id } })

  return await prisma.$transaction(async (tx) => {
    // 1. Record Webhook / Gateway Callback Event
    await tx.webhookEvent.create({
      data: {
        paymentId: payment?.id || null,
        gateway,
        eventData: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
        status
      }
    })

    if (status !== 'SUCCESS') {
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        })
      }
      return { success: false, isPaid: false, order }
    }

    // 2. If status is SUCCESS and order is not yet paid:
    if (!order.isPaid) {
      await tx.order.update({
        where: { id: order.id },
        data: { isPaid: true, status: 'PROCESSING' }
      })

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            transactionId: transactionId || payment.transactionId || undefined
          }
        })
      }

      // 3. Write Purchases with orderId unique key
      for (const item of order.orderItems) {
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            orderId_productId: {
              orderId: order.id,
              productId: item.productId
            }
          }
        })

        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: order.userId,
              productId: item.productId,
              orderId: order.id,
              quantity: item.quantity,
              pricePaid: item.price,
              paymentMethod: order.paymentMethod
            }
          })
        }
      }
    }

    return { success: true, isPaid: true, order }
  })
}
