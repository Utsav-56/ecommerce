import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { retryPaymentAction } from '@/lib/actions/orders'

export function useRetryPayment() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const processRetryPayment = async (orderId) => {
    setLoading(true)
    try {
      const res = await retryPaymentAction(orderId)
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl)
      } else {
        toast.error(res.error || 'Failed to initiate payment.')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while retrying payment.')
    } finally {
      setLoading(false)
    }
  }

  return {
    processRetryPayment,
    isRetryLoading: loading
  }
}
