'use client'
import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { CreditCardIcon, LandmarkIcon, ShieldCheckIcon, AlertCircleIcon } from "lucide-react"

function StripeSandboxContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("idle") // idle, success, failed

  useEffect(() => {
    if (!orderId || !paymentId) {
      toast.error("Invalid checkout parameters.")
      router.push('/cart')
    }
  }, [orderId, paymentId, router])

  const triggerPaymentWebhook = async (outcome) => {
    setLoading(true)
    try {
      const res = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          status: outcome
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        if (outcome === 'SUCCESS') {
          setStatus('success')
          toast.success("Simulated Payment Completed Successfully!")
          setTimeout(() => {
            router.push('/orders')
          }, 2500)
        } else {
          setStatus('failed')
          toast.error("Simulated Payment Failed.")
          setLoading(false)
        }
      } else {
        toast.error(data.error || "Failed to process simulation.")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during simulation.")
      setLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
          <ShieldCheckIcon size={36} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 mb-6">Your payment has been simulated successfully via webhook. Redirecting to your orders list...</p>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 py-12 px-6 text-slate-650">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCardIcon size={22} className="text-slate-300" />
            <h2 className="font-semibold tracking-wide">Stripe Sandbox</h2>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
            TEST MODE
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">ORDER REFERENCE</p>
            <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{orderId}</p>
            <p className="text-xs text-slate-400 font-medium mt-3">PAYMENT REFERENCE</p>
            <p className="text-sm font-semibold text-slate-850 mt-1 truncate">{paymentId}</p>
          </div>

          <p className="text-xs text-slate-405 leading-relaxed mb-6">
            This is a mock Stripe Checkout Portal created for college project demonstration. You can simulate either a successful webhook payment or a credit card authentication failure below.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => triggerPaymentWebhook('SUCCESS')}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheckIcon size={18} />
                  Simulate Webhook Success
                </>
              )}
            </button>

            <button
              onClick={() => triggerPaymentWebhook('FAILED')}
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-slate-250"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-650 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <AlertCircleIcon size={18} />
                  Simulate Webhook Failure
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <LandmarkIcon size={12} />
          Secured Sandbox | GoCart Inc.
        </div>

      </div>
    </div>
  )
}

export default function StripeSandbox() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading payment gateway...</div>}>
      <StripeSandboxContent />
    </Suspense>
  )
}
