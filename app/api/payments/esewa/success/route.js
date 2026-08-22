import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { config } from '@/lib/config'
import { recordPaymentResult } from '@/lib/domain/payments/resultHandler'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.redirect(new URL('/orders?error=esewa_missing_payload', request.url))
    }

    let payload
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8')
      payload = JSON.parse(decodedData)
    } catch (e) {
      return NextResponse.redirect(new URL('/orders?error=esewa_corrupted_payload', request.url))
    }

    if (!payload.signed_field_names || !payload.signature || !payload.transaction_uuid) {
      return NextResponse.redirect(new URL('/orders?error=esewa_malformed_payload', request.url))
    }

    // Verify HMAC SHA256 Signature
    const secret = config.esewa.secretKey
    const fields = payload.signed_field_names.split(',')
    const message = fields.map(field => `${field}=${payload[field]}`).join(',')
    const expectedSignature = crypto.createHmac('sha256', secret).update(message).digest('base64')

    if (expectedSignature !== payload.signature) {
      console.error('eSewa signature mismatch!', { expectedSignature, received: payload.signature })
      await recordPaymentResult({
        gateway: 'ESEWA',
        orderId: payload.transaction_uuid,
        status: 'FAILED',
        payload: { ...payload, failureReason: 'signature_mismatch' }
      }).catch(() => {})

      return NextResponse.redirect(new URL('/orders?error=esewa_invalid_signature', request.url))
    }

    const isSuccess = payload.status === 'COMPLETE' || payload.status === 'SUCCESS'

    const result = await recordPaymentResult({
      gateway: 'ESEWA',
      orderId: payload.transaction_uuid,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      payload,
      transactionId: payload.transaction_code || undefined
    })

    if (result.isPaid) {
      return NextResponse.redirect(new URL('/profile?payment=success', request.url))
    } else {
      return NextResponse.redirect(new URL('/orders?error=esewa_payment_unsuccessful', request.url))
    }
  } catch (error) {
    console.error('eSewa Webhook Error:', error)
    return NextResponse.redirect(new URL('/orders?error=esewa_verification_failed', request.url))
  }
}
