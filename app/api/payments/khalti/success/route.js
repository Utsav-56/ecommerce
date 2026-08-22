import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { recordPaymentResult } from '@/lib/domain/payments/resultHandler'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pidx = searchParams.get('pidx')
    const purchase_order_id = searchParams.get('purchase_order_id')

    if (!pidx || !purchase_order_id) {
      return NextResponse.redirect(new URL('/orders?error=khalti_invalid_payload', request.url))
    }

    // MANDATORY Khalti API Lookup Verification
    const khaltiSecret = config.khalti.secretKey
    const verifyResponse = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': khaltiSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pidx })
    })

    if (!verifyResponse.ok) {
      const errorPayload = await verifyResponse.json().catch(() => ({}))
      console.error('Khalti API lookup verification failed:', errorPayload)

      await recordPaymentResult({
        gateway: 'KHALTI',
        orderId: purchase_order_id,
        status: 'FAILED',
        payload: { pidx, lookupError: errorPayload },
        transactionId: pidx
      }).catch(() => {})

      return NextResponse.redirect(new URL('/orders?error=khalti_verification_failed', request.url))
    }

    const payload = await verifyResponse.json()

    // MUST ONLY trust response from Khalti API (not browser query params)
    const isCompleted = payload.status === 'Completed'

    const result = await recordPaymentResult({
      gateway: 'KHALTI',
      orderId: purchase_order_id,
      status: isCompleted ? 'SUCCESS' : 'FAILED',
      payload,
      transactionId: pidx
    })

    if (result.isPaid) {
      return NextResponse.redirect(new URL('/profile?payment=success', request.url))
    } else {
      return NextResponse.redirect(new URL('/orders?error=khalti_payment_failed', request.url))
    }
  } catch (error) {
    console.error('Khalti Webhook Processing Error:', error)
    return NextResponse.redirect(new URL('/orders?error=khalti_processing_failed', request.url))
  }
}
