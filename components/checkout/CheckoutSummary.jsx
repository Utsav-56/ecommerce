'use client'

export default function CheckoutSummary({
  currency,
  totalPrice,
  handlePlaceOrder,
  isPaymentLoading,
  paymentMethod
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="text-lg font-semibold text-foreground mb-5">
        Checkout Summary
      </h3>

      {/* Cost Rows */}
      <div className="space-y-3 pb-5 border-b border-border text-sm">
        <div className="flex justify-between text-muted-foreground">
          <p>Subtotal:</p>
          <p className="font-semibold text-foreground">
            {currency}
            {totalPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <p>Shipping:</p>
          <p className="text-emerald-600 font-semibold">Free</p>
        </div>
      </div>

      {/* Total Price */}
      <div className="flex justify-between py-5 text-slate-850 font-bold">
        <p className="text-base">Order Total:</p>
        <p className="text-xl">
          {currency}
          {totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Checkout Trigger */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isPaymentLoading}
        className="w-full bg-indigo-650 hover:bg-indigo-750 text-primary-foreground py-3 rounded-xl font-semibold transition active:scale-97 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
      >
        {isPaymentLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : paymentMethod === "COD" ? (
          "Place Order (COD)"
        ) : (
          "Proceed to Payment"
        )}
      </button>
    </div>
  )
}
