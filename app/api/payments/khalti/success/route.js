import { NextResponse } from "next/server"
import { completeOrderPaymentAction } from "@/lib/actions/orders"

export async function GET(req) {
  try {
    const status = req.nextUrl.searchParams.get('status')
    const orderId = req.nextUrl.searchParams.get('purchase_order_id')
    const pidx = req.nextUrl.searchParams.get('pidx')

    if (status === 'Completed' && orderId) {
      // Record payment success in DB
      const result = await completeOrderPaymentAction({
        orderId,
        paymentMethod: 'KHALTI'
      })

      if (result.success) {
        return NextResponse.redirect(new URL('/profile?payment=success', req.url))
      }
    }

    console.error("Khalti payment validation failed. Status:", status, "Pidx:", pidx)
    return NextResponse.redirect(new URL(`/cart?payment=failed&orderId=${orderId || ''}`, req.url))
  } catch (error) {
    console.error('Khalti callback handler error:', error)
    return NextResponse.redirect(new URL('/cart?payment=error', req.url))
  }
}
