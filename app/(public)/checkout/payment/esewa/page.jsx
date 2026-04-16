import crypto from 'crypto'
import { Suspense } from 'react'

async function EsewaRedirectContent({ searchParamsPromise }) {
  const searchParams = await searchParamsPromise
  const orderId = searchParams.orderId
  const amount = searchParams.amount
  
  if (!orderId || !amount) {
    return (
      <div className="text-center py-20 text-slate-500">
        <h2 className="text-xl font-bold">Invalid checkout references</h2>
        <p className="text-sm text-slate-400 mt-2">Could not resolve payment credentials.</p>
      </div>
    )
  }

  // Generate eSewa ePay v2 Signature
  // Formula: signature = HMAC-SHA256(secret, message)
  // Message: total_amount=X,transaction_uuid=Y,product_code=EPAYTEST
  const secret = '8g8t8ruptcZ2U5gD' // test secret
  const message = `total_amount=${amount},transaction_uuid=${orderId},product_code=EPAYTEST`
  const signature = crypto.createHmac('sha256', secret).update(message).digest('base64')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const successUrl = `${appUrl}/api/payments/esewa/success`
  const failureUrl = `${appUrl}/api/payments/esewa/failure`

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-650 px-6 text-center">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-150 flex items-center justify-center text-xl font-bold mb-4">
        e
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Connecting to eSewa ePay</h2>
      <p className="text-sm text-slate-400 mb-6">Please wait while we redirect you to the merchant portal...</p>
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>

      {/* Hidden form auto-submitting to eSewa Sandbox */}
      <form id="esewa-form" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST" className="hidden">
        <input type="hidden" name="amount" value={amount} />
        <input type="hidden" name="tax_amount" value="0" />
        <input type="hidden" name="total_amount" value={amount} />
        <input type="hidden" name="transaction_uuid" value={orderId} />
        <input type="hidden" name="product_code" value="EPAYTEST" />
        <input type="hidden" name="product_service_charge" value="0" />
        <input type="hidden" name="product_delivery_charge" value="0" />
        <input type="hidden" name="success_url" value={successUrl} />
        <input type="hidden" name="failure_url" value={failureUrl} />
        <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
        <input type="hidden" name="signature" value={signature} />
        <button type="submit">Submit</button>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('esewa-form').submit();
          `
        }}
      />
    </div>
  )
}

export default async function EsewaRedirectPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="text-center py-20">Preparing eSewa Gateway...</div>}>
      <EsewaRedirectContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}
