'use client'
import { DotIcon } from "lucide-react"
import { getStatusBadgeStyle } from "@/lib/utils/format"

export default function OrderStatus({ status }) {
  const badgeStyle = getStatusBadgeStyle(status)
  const label = (status || '').split('_').join(' ').toLowerCase()

  return (
    <div className={`flex items-center justify-center gap-1 rounded-full p-1 text-xs font-semibold px-2 py-0.5 border ${badgeStyle}`}>
      <DotIcon size={10} className="scale-250" />
      {label}
    </div>
  )
}
