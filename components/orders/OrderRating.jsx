'use client'
import Rating from "../Rating"

export default function OrderRating({ existingRating, orderStatus, onRateClick }) {
  if (existingRating) {
    return <Rating value={existingRating.rating} />
  }

  if (orderStatus !== 'DELIVERED') return null

  return (
    <button
      type="button"
      onClick={onRateClick}
      className="text-primary hover:bg-green-50 transition cursor-pointer text-xs font-semibold"
    >
      Rate Product
    </button>
  )
}
