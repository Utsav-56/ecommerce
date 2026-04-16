'use client'
import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { CreditCardIcon, LandmarkIcon, ShieldCheckIcon, AlertCircleIcon } from "lucide-react"
import { completeOrderPaymentAction } from "@/lib/actions/orders"

function PaymentSandboxContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const method = searchParams.get('method') || 'STRIPE'
  
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("idle") // idle, success, failed

  useEffect(() => {
    if (!orderId || !paymentId) {
      toast.error("Invalid checkout reference parameters.")
      router.push('/cart')
    }
  }, [orderId, paymentId, router])

  const handlePaymentOutcome = async (outcome) => {
    setLoading(true)
    try {
      if (outcome === 'SUCCESS') {
        const res = await completeOrderPaymentAction({
          orderId,
          paymentMethod: method
        })

        if (res.success) {
          setStatus('success')
          toast.success(`Payment completed successfully via ${method}!`)
          setTimeout(() => {
            router.push('/profile')
          }, 2500)
        } else {
          toast.error(res.error || "Failed to process transaction.")
          setLoading(false)
        }
      } else {
        setStatus('failed')
        toast.error("Simulation: Payment authorization rejected by bank.")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during payment simulation.")
      setLoading(false)
    }
  }

  // Dynamic Theme Definitions
  const themes = {
    STRIPE: {
      title: "Stripe Billing",
      color: "bg-slate-800",
      accent: "accent-slate-600",
      btnColor: "bg-slate-800 hover:bg-slate-900",
      text: "International Card Payment Portal",
      fields: [
        { label: "Cardholder Name", placeholder: "e.g. John Doe", type: "text" },
        { label: "Card Number", placeholder: "•••• •••• •••• ••••", type: "text" },
        { label: "Expiration Date", placeholder: "MM / YY", type: "text" },
        { label: "CVC / CVV", placeholder: "•••", type: "password" }
      ]
    },
    PAYPAL: {
      title: "PayPal Checkout",
      color: "bg-blue-600",
      accent: "accent-blue-600",
      btnColor: "bg-blue-600 hover:bg-blue-700",
      text: "PayPal Secure Checkout Gateway",
      fields: [
        { label: "PayPal Email", placeholder: "e.g. user@paypal.com", type: "email" },
        { label: "PayPal Account Password", placeholder: "••••••••", type: "password" }
      ]
    },
    KHALTI: {
      title: "Khalti Sandbox",
      color: "bg-purple-700",
      accent: "accent-purple-700",
      btnColor: "bg-purple-700 hover:bg-purple-800",
      text: "Khalti Wallet Initiate Sandbox Portal",
      fields: [
        { label: "Khalti Mobile Number", placeholder: "e.g. 98XXXXXXXX", type: "tel" },
        { label: "Khalti Transaction PIN", placeholder: "••••", type: "password" }
      ]
    }
  }

  const currentTheme = themes[method] || themes.STRIPE

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-6 text-slate-650">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
          <ShieldCheckIcon size={36} />
        </div>
        <h1 className="text-2xl font-bold text-slate-850 mb-2">Payment Completed!</h1>
        <p className="text-slate-500 mb-6">Your order is now processing. Redirecting to your profile purchase history...</p>
        <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] bg-slate-50 py-12 px-6 text-slate-650">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Dynamic Header */}
        <div className={`p-6 ${currentTheme.color} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <CreditCardIcon size={22} className="text-slate-200" />
            <h2 className="font-semibold tracking-wide">{currentTheme.title}</h2>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
            SANDBOX
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm font-medium text-slate-700 mb-4">{currentTheme.text}</p>
          
          <div className="space-y-4 mb-6">
            {currentTheme.fields.map((f, idx) => (
              <div key={idx}>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase tracking-wider">
                  {f.label}
                </label>
                <input 
                  type={f.type} 
                  placeholder={f.placeholder}
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-lg p-2.5 px-3.5 outline-none text-slate-800 focus:border-indigo-500 bg-slate-50 focus:bg-white text-sm transition"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handlePaymentOutcome('SUCCESS')}
              disabled={loading}
              className={`w-full ${currentTheme.btnColor} text-white py-3 rounded-xl font-semibold transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheckIcon size={18} />
                  Authorize Payment (Success)
                </>
              )}
            </button>

            <button
              onClick={() => handlePaymentOutcome('FAILED')}
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-slate-250"
            >
              <AlertCircleIcon size={18} />
              Reject Payment (Failure)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <LandmarkIcon size={12} />
          Secured Gateway Connection | GoCart Inc.
        </div>

      </div>
    </div>
  )
}

export default function PaymentSandbox() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading Sandbox Portal...</div>}>
      <PaymentSandboxContent />
    </Suspense>
  )
}
