import { NextResponse } from "next/server"

export async function GET(req) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId') || ''
    console.warn("eSewa payment cancelled or failed for order:", orderId)
    return NextResponse.redirect(new URL(`/cart?payment=failed&orderId=${orderId}`, req.url))
  } catch (error) {
    console.error('eSewa failure callback handler error:', error)
    return NextResponse.redirect(new URL('/cart', req.url))
  }
}
