'use client'

export default function RetryPaymentButton({ orderId, status, handlePayNow, isRetryLoading }) {
  if (status !== 'PENDING_PAYMENT') return null

  return (
    <button
      type="button"
      onClick={handlePayNow}
      disabled={isRetryLoading}
      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded transition disabled:opacity-50 cursor-pointer"
    >
      {isRetryLoading ? "Processing..." : "Pay Now"}
    </button>
  )
}
