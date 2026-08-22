'use client'
import { ArcticonsEsewa, ArcticonsKhalti } from "@/components/icons/payment-methods"

export default function PaymentMethodSelector({ paymentMethod, setPaymentMethod }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Select Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* eSewa */}
        <label
          className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
            paymentMethod === "ESEWA"
              ? "border-emerald-500 bg-emerald-50/20"
              : "border-border hover:border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="payment_method"
              value="ESEWA"
              checked={paymentMethod === "ESEWA"}
              onChange={() => setPaymentMethod("ESEWA")}
              className="accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <ArcticonsEsewa className="text-[#60bb46] text-2xl" />
              <div>
                <p className="text-sm font-semibold text-slate-850">eSewa</p>
                <p className="text-xs text-muted-foreground">Local Wallet</p>
              </div>
            </div>
          </div>
        </label>

        {/* Khalti */}
        <label
          className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
            paymentMethod === "KHALTI"
              ? "border-purple-500 bg-purple-50/20"
              : "border-border hover:border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="payment_method"
              value="KHALTI"
              checked={paymentMethod === "KHALTI"}
              onChange={() => setPaymentMethod("KHALTI")}
              className="accent-purple-600 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <ArcticonsKhalti className="text-[#5c2d91] text-2xl" />
              <div>
                <p className="text-sm font-semibold text-slate-850">Khalti</p>
                <p className="text-xs text-muted-foreground">Local Wallet</p>
              </div>
            </div>
          </div>
        </label>

        {/* COD */}
        <label
          className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
            paymentMethod === "COD"
              ? "border-slate-500 bg-background"
              : "border-border hover:border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="payment_method"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
              className="accent-slate-500 cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-slate-850">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted-foreground">Pay on Hand</p>
            </div>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
            COD
          </span>
        </label>
      </div>
    </div>
  )
}
