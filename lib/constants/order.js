export const ORDER_STATUSES = {
  ORDER_PLACED: 'ORDER_PLACED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED'
}

export function isAllowedOrderStatus(value) {
  return typeof value === 'string' && Object.values(ORDER_STATUSES).includes(value.trim().toUpperCase())
}
