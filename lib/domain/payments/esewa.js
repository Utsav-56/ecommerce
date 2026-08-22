import crypto from 'crypto'

export function initiateEsewaPayment({ orderId, totalAmount, returnUrl, failureUrl }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const productCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
  const secretKey = process.env.ESEWA_SECRET_KEY || '8g8t8ruptcZ2U5gD'

  const message = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${productCode}`
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64')

  const esewaPayload = {
    amount: totalAmount,
    tax_amount: 0,
    total_amount: totalAmount,
    transaction_uuid: orderId,
    product_code: productCode,
    product_delivery_charge: 0,
    product_service_charge: 0,
    success_url: returnUrl || `${appUrl}/api/payments/esewa/success`,
    failure_url: failureUrl || `${appUrl}/checkout`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: signature
  }

  const queryParams = new URLSearchParams()
  for (const [key, value] of Object.entries(esewaPayload)) {
    queryParams.append(key, String(value))
  }

  return `/checkout/esewa?${queryParams.toString()}`
}
