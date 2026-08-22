'use client'
import { Suspense } from "react"
import { useSelector } from "react-redux"
import { useProductFilters } from "@/hooks/useProductFilters"
import ShopFilters from "@/components/shop/ShopFilters"
import ProductGrid from "@/components/shop/ProductGrid"

function ShopContent() {
    const products = useSelector(state => state.product.list)
    const {
        categories,
        search,
        selectedCategories,
        handleCategoryToggle,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        sortBy,
        setSortBy,
        resetFilters,
        sortedProducts
    } = useProductFilters(products)

    return (
        <div className="min-h-[70vh] mx-6 my-8 text-foreground">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                <ShopFilters
                    categories={categories}
                    search={search}
                    selectedCategories={selectedCategories}
                    handleCategoryToggle={handleCategoryToggle}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    resetFilters={resetFilters}
                />
                <ProductGrid
                    sortedProducts={sortedProducts}
                    search={search}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    resetFilters={resetFilters}
                />
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