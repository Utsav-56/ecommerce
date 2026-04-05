import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const { orderId, paymentId, status } = await req.json()

    if (!orderId || !paymentId) {
      return NextResponse.json({ success: false, error: 'Missing orderId or paymentId.' }, { status: 400 })
    }

    if (status === 'SUCCESS') {
      const transactionId = `txn_${Math.random().toString(36).substring(2, 12).toUpperCase()}`

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { isPaid: true }
        }),
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'SUCCESS',
            transactionId
          }
        })
      ])

      return NextResponse.json({ success: true, message: 'Payment recorded successfully.' })
    } else {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      })
      return NextResponse.json({ success: true, message: 'Payment recorded as failed.' })
    }
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ success: false, error: 'Webhook processing failed.' }, { status: 500 })
  }
}
