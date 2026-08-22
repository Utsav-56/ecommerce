import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ELECTRONICS_CATEGORIES } from '@/lib/constants/categories'

export function useProductFilters(products = []) {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const router = useRouter()

  const [selectedCategories, setSelectedCategories] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
    if (search) {
      router.push('/shop')
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false
      }
      if (minPrice && product.price < parseFloat(minPrice)) {
        return false
      }
      if (maxPrice && product.price > parseFloat(maxPrice)) {
        return false
      }
      return true
    })
  }, [products, search, selectedCategories, minPrice, maxPrice])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-low-to-high') {
        return a.price - b.price
      }
      if (sortBy === 'price-high-to-low') {
        return b.price - a.price
      }
      if (sortBy === 'best-selling') {
        return (b.salesCount || 0) - (a.salesCount || 0)
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [filteredProducts, sortBy])

  return {
    categories: ELECTRONICS_CATEGORIES,
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
  }
}
