export function formatCurrency(amount) {
  const symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  return `${symbol}${val.toFixed(2)}`
}

export function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return new Date(dateString).toDateString()
  } catch (e) {
    return String(dateString)
  }
}

export function getStatusBadgeStyle(status) {
  switch (status) {
    case 'DELIVERED':
      return 'text-emerald-700 bg-emerald-50 border-emerald-250'
    case 'ORDER_PLACED':
      return 'text-amber-700 bg-amber-50 border-amber-250'
    default:
      return 'text-indigo-700 bg-indigo-50 border-indigo-250'
  }
}
