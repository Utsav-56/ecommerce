export function buildCartItems(cartItems = {}, products = []) {
  const items = []
  if (!cartItems || !products) return items

  for (const [productId, quantity] of Object.entries(cartItems)) {
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) continue

    const product = products.find(p => p.id === productId)
    if (product) {
      items.push({
        ...product,
        quantity: qty
      })
    }
  }

  return items
}

export function calculateCartTotal(items = []) {
  if (!Array.isArray(items)) return 0
  return items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0
    const price = parseFloat(item.price) || 0
    return sum + (qty * price)
  }, 0)
}
