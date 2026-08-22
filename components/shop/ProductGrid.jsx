'use client'
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProductGrid({
  sortedProducts,
  search,
  sortBy,
  setSortBy,
  resetFilters
}) {
  const router = useRouter()

  return (
    <div className="flex-1">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1
          onClick={() => router.push('/shop')}
          className="text-2xl text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-foreground transition"
        >
          {search && <MoveLeftIcon size={20} />}
          All <span className="text-foreground font-bold">Products</span>
          <span className="text-sm font-normal text-muted-foreground ml-1">
            ({sortedProducts.length})
          </span>
        </h1>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-border rounded-lg p-1.5 px-3 text-sm text-slate-750 outline-none focus:border-primary bg-card cursor-pointer font-medium"
          >
            <option value="newest">Newest</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            <option value="best-selling">Best Selling</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-card p-6 shadow-sm">
          <p className="text-muted-foreground mb-2 font-medium">
            No products match your filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-primary hover:text-indigo-800 font-bold transition cursor-pointer"
          >
            Clear filters and try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 mb-32">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
