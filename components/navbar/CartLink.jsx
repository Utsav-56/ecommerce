'use client'
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function CartLink({ cartCount }) {
  return (
    <Link href="/cart" className="relative flex items-center gap-2 hover:text-primary transition-colors">
      <ShoppingCart size={18} />
      Cart
      <span className="absolute -top-1 left-3 text-[8px] text-primary-foreground bg-primary size-3.5 rounded-full flex items-center justify-center font-bold">
        {cartCount}
      </span>
    </Link>
  )
}
