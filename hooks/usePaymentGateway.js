import { useCheckoutPayment } from './useCheckoutPayment'
import { useRetryPayment } from './useRetryPayment'

export function usePaymentGateway() {
  const { processCheckout, isCheckoutLoading } = useCheckoutPayment()
  const { processRetryPayment, isRetryLoading } = useRetryPayment()

  return {
    processCheckout,
    processRetryPayment,
    isPaymentLoading: isCheckoutLoading || isRetryLoading
  }
}

export { useCheckoutPayment, useRetryPayment }
