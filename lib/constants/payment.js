export const PAYMENT_METHODS = {
  COD: 'COD',
  ESEWA: 'ESEWA',
  KHALTI: 'KHALTI'
}

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

export function isAllowedPaymentMethod(value) {
  return typeof value === 'string' && Object.values(PAYMENT_METHODS).includes(value.trim().toUpperCase())
}
