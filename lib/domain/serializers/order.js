import { serializeProduct } from "./product"
import { serializeAddress } from "./address"

export function serializeOrder(order) {
  if (!order) return null
  return {
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
    address: order.address ? serializeAddress(order.address) : null,
    orderItems: (order.orderItems || []).map(item => ({
      ...item,
      product: item.product ? serializeProduct(item.product) : null
    }))
  }
}
