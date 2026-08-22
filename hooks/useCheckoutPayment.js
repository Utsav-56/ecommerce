import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { placeOrderAction } from '@/lib/actions/orders'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/lib/features/cart/cartSlice'

export function useCheckoutPayment() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const processCheckout = async (orderPayload) => {
    setLoading(true)
    try {
      const res = await placeOrderAction(orderPayload)
      if (res.success) {
        if (res.warning) {
          toast.success(res.warning)
        } else {
          toast.success(
            orderPayload.paymentMethod === 'COD'
              ? 'Order placed successfully!'
              : 'Order placed! Proceeding to payment...'
          )
        }

        if (res.redirectUrl) {
          router.push(res.redirectUrl)
        } else {
          router.push('/profile')
        }

        setTimeout(() => dispatch(clearCart()), 1000)
      } else {
        toast.error(res.error || 'Failed to place order.')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while placing order.')
    } finally {
      setLoading(false)
    }
  }

  return {
    processCheckout,
    isCheckoutLoading: loading
  }
}
