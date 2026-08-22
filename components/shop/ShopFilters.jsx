'use client'
import { useRouter } from "next/navigation"

export default function ShopFilters({
  categories,
  search,
  selectedCategories,
  handleCategoryToggle,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  resetFilters
}) {
  const router = useRouter()

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="border border-border p-5 rounded-xl bg-card sticky top-24 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-border mb-5">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-indigo-650 hover:text-indigo-850 font-medium cursor-pointer"
          >
            Reset All
          </button>
        </div>

        {/* Search Term Badge */}
        {search && (
          <div className="mb-5">
            <p className="text-xs text-muted-foreground mb-2">Search Query</p>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-150 text-foreground text-xs font-medium rounded-full">
              "{search}"
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="text-muted-foreground hover:text-muted-foreground ml-1 font-bold cursor-pointer"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-850 mb-3">Categories</p>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer hover:text-foreground transition"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="rounded border-border text-primary focus:ring-indigo-500 cursor-pointer"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-850 mb-3">Price Range ($)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-border rounded-lg p-2 px-3 outline-none text-sm text-foreground focus:border-primary bg-background focus:bg-card transition"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-border rounded-lg p-2 px-3 outline-none text-sm text-foreground focus:border-primary bg-background focus:bg-card transition"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
