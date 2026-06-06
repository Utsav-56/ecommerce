import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { completeOrderPaymentAction } from '@/lib/actions/orders'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.redirect(new URL('/cart?error=esewa_invalid_payload', request.url))
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8')
    const payload = JSON.parse(decodedData)

    // Verify signature
    const secret = process.env.ESEWA_SECRET_KEY || '8g8t8ruptcZ2U5gD'
    const fields = payload.signed_field_names.split(',')
    const message = fields.map(field => `${field}=${payload[field]}`).join(',')
    
    const expectedSignature = crypto.createHmac('sha256', secret).update(message).digest('base64')

    if (expectedSignature !== payload.signature) {
      return NextResponse.redirect(new URL('/cart?error=esewa_invalid_signature', request.url))
    }

    const orderId = payload.transaction_uuid

    const payment = await prisma.payment.findFirst({
      where: { orderId }
    })

    // Save webhook event
    await prisma.webhookEvent.create({
      data: {
        gateway: 'ESEWA',
        eventData: JSON.stringify(payload),
        status: payload.status,
        paymentId: payment ? payment.id : null
      }
    })

    if (payload.status !== 'COMPLETE') {
      return NextResponse.redirect(new URL('/cart?error=esewa_payment_failed', request.url))
    }

    // Complete order
    const res = await completeOrderPaymentAction({ orderId, paymentMethod: 'ESEWA' })
    if (res.success) {
      return NextResponse.redirect(new URL('/profile?payment=success', request.url))
    } else {
      return NextResponse.redirect(new URL(`/cart?error=${res.error}`, request.url))
    }
  } catch (error) {
    console.error('eSewa Webhook Error:', error)
    return NextResponse.redirect(new URL('/cart?error=esewa_processing_failed', request.url))
  }
}
