export async function initiateKhaltiPayment({ orderId, totalAmount, productName, customerName, customerEmail, returnUrl }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  let khaltiSecret = process.env.KHALTI_SECRET_KEY
  if (!khaltiSecret) {
    throw new Error('Khalti credentials missing in .env')
  }
  if (!khaltiSecret.startsWith('Key ')) {
    khaltiSecret = `Key ${khaltiSecret}`
  }

  const khaltiResponse = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
    method: 'POST',
    headers: {
      'Authorization': khaltiSecret,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      return_url: returnUrl || `${appUrl}/api/payments/khalti/success`,
      website_url: appUrl,
      amount: Math.round(totalAmount * 100),
      purchase_order_id: orderId,
      purchase_order_name: (productName || 'GoCart Order').substring(0, 50),
      customer_info: {
        name: customerName || 'Customer',
        email: customerEmail || 'customer@example.com',
        phone: '9800000000'
      }
    })
  })

  const khaltiData = await khaltiResponse.json()
  
  if (khaltiResponse.ok && khaltiData.payment_url) {
    return {
      paymentUrl: khaltiData.payment_url,
      pidx: khaltiData.pidx
    }
  }

  throw new Error(khaltiData.detail || `Khalti initiation failed: ${JSON.stringify(khaltiData)}`)
}
