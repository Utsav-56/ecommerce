'use client'
import { Suspense, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState([])
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [sortBy, setSortBy] = useState("newest")

    // Hardcoded list of categories
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const handleCategoryToggle = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const resetFilters = () => {
        setSelectedCategories([])
        setMinPrice("")
        setMaxPrice("")
        setSortBy("newest")
        if (search) {
            router.push('/shop')
        }
    }

    // Apply filtering
    const filteredProducts = products.filter(product => {
        // Search filter
        if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
            return false
        }
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
            return false
        }
        // Price filters
        if (minPrice && product.price < parseFloat(minPrice)) {
            return false
        }
        if (maxPrice && product.price > parseFloat(maxPrice)) {
            return false
        }
        return true
    })

    // Apply sorting
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low-to-high') {
            return a.price - b.price
        }
        if (sortBy === 'price-high-to-low') {
            return b.price - a.price
        }
        if (sortBy === 'best-selling') {
            return b.salesCount - a.salesCount
        }
        // default: newest
        return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return (
        <div className="min-h-[70vh] mx-6 my-8 text-foreground">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="border border-border p-5 rounded-xl bg-card sticky top-24 shadow-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-border mb-5">
                            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                            <button 
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
                                    <label key={cat} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer hover:text-foreground transition">
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

                {/* Products Grid Section */}
                <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h1 
                            onClick={() => router.push('/shop')} 
                            className="text-2xl text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-foreground transition"
                        > 
                            {search && <MoveLeftIcon size={20} />}  
                            All <span className="text-foreground font-bold">Products</span>
                            <span className="text-sm font-normal text-muted-foreground ml-1">({sortedProducts.length})</span>
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
                            <p className="text-muted-foreground mb-2 font-medium">No products match your filters.</p>
                            <button 
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

            </div>
        </div>
    )
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}