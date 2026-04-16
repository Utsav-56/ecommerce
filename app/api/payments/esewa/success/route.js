import { NextResponse } from "next/server"
import { completeOrderPaymentAction } from "@/lib/actions/orders"

export async function GET(req) {
  try {
    const dataBase64 = req.nextUrl.searchParams.get('data')
    if (!dataBase64) {
      console.error("eSewa success callback missing data param.")
      return NextResponse.redirect(new URL('/cart?payment=error', req.url))
    }

    // Decode base64 payload from eSewa
    const decodedString = Buffer.from(dataBase64, 'base64').toString('utf-8')
    const decoded = JSON.parse(decodedString)
    
    const orderId = decoded.transaction_uuid
    const status = decoded.status

    if (status === 'COMPLETE' && orderId) {
      // Record payment success
      const result = await completeOrderPaymentAction({
        orderId,
        paymentMethod: 'ESEWA'
      })

      if (result.success) {
        return NextResponse.redirect(new URL('/profile?payment=success', req.url))
      }
    }

    console.error("eSewa payment validation failed:", decoded)
    return NextResponse.redirect(new URL(`/cart?payment=failed&orderId=${orderId || ''}`, req.url))
  } catch (error) {
    console.error('eSewa callback handler error:', error)
    return NextResponse.redirect(new URL('/cart?payment=error', req.url))
  }
}
