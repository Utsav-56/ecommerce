import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { completeOrderPaymentAction } from '@/lib/actions/orders'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pidx = searchParams.get('pidx')
    const status = searchParams.get('status')
    const purchase_order_id = searchParams.get('purchase_order_id')

    if (!pidx || !purchase_order_id) {
      return NextResponse.redirect(new URL('/cart?error=khalti_invalid_payload', request.url))
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId: purchase_order_id }
    })

    // Verify with Khalti Lookup API
    let khaltiSecret = process.env.KHALTI_SECRET_KEY;
    if (khaltiSecret && !khaltiSecret.startsWith('Key ')) {
        khaltiSecret = `Key ${khaltiSecret}`;
    }
    let payload = { status: status, pidx }
    
    try {
        const verifyResponse = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
        method: 'POST',
        headers: {
            'Authorization': khaltiSecret,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pidx })
        })
        if (verifyResponse.ok) {
            payload = await verifyResponse.json()
        }
    } catch (e) {
        console.error('Khalti lookup failed', e)
    }

    // Save webhook event
    await prisma.webhookEvent.create({
      data: {
        gateway: 'KHALTI',
        eventData: JSON.stringify(payload),
        status: payload.status || status,
        paymentId: payment ? payment.id : null
      }
    })

    if (payload.status === 'Completed' || status === 'Completed') {
      // Complete order
      const res = await completeOrderPaymentAction({ orderId: purchase_order_id, paymentMethod: 'KHALTI' })
      if (res.success) {
        return NextResponse.redirect(new URL('/profile?payment=success', request.url))
      } else {
        return NextResponse.redirect(new URL(`/cart?error=${res.error}`, request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/cart?error=khalti_payment_failed', request.url))
    }
  } catch (error) {
    console.error('Khalti Webhook Error:', error)
    return NextResponse.redirect(new URL('/cart?error=khalti_processing_failed', request.url))
  }
}
