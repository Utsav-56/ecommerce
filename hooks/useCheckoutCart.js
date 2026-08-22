import { useMemo } from 'react'

export function useCheckoutCart(cartItems, products) {
  return useMemo(() => {
    let total = 0
    const items = []

    if (!cartItems || !products) {
      return { cartArray: [], totalPrice: 0 }
    }

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((p) => p.id === key)
      if (product) {
        items.push({
          ...product,
          quantity: value,
        })
        total += product.price * value
      }
    }

    return { cartArray: items, totalPrice: total }
  }, [cartItems, products])
}
