'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getProductsAction, toggleStockAction, deleteProductAction } from "@/lib/actions/products"
import { setProduct } from "@/lib/features/product/productSlice"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { Trash2Icon, EyeIcon, EyeOffIcon } from "lucide-react"

export default function ManageProducts() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.list)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null) // ID of product in transition

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await getProductsAction()
      if (res.success) {
        dispatch(setProduct(res.products))
      } else {
        toast.error("Failed to load products.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred loading products.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStock = async (productId) => {
    setActionLoading(productId)
    try {
      const res = await toggleStockAction(productId)
      if (res.success) {
        // Update local list
        const updatedList = products.map((p) =>
          p.id === productId ? { ...p, inStock: res.product.inStock } : p
        )
        dispatch(setProduct(updatedList))
        toast.success("Stock status updated successfully!")
      } else {
        toast.error(res.error || "Failed to update stock.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }
    setActionLoading(productId)
    try {
      const res = await deleteProductAction(productId)
      if (res.success) {
        // Update local list
        const updatedList = products.filter((p) => p.id !== productId)
        dispatch(setProduct(updatedList))
        toast.success("Product deleted successfully!")
      } else {
        toast.error(res.error || "Failed to delete product.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="text-muted-foreground mb-28">
      <h1 className="text-2xl text-foreground font-medium">Manage Products</h1>
      <p className="mt-2 text-sm text-muted-foreground">View, toggle stock availability, or delete existing products in the database.</p>

      <div className="mt-8 border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background text-muted-foreground font-medium">
                <th className="p-4 px-6">Product Image</th>
                <th className="p-4 px-6">Name</th>
                <th className="p-4 px-6">Category</th>
                <th className="p-4 px-6">Price</th>
                <th className="p-4 px-6">Stock Status</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products found. Add some products to see them here!
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const firstImage = product.images?.[0] || "/placeholder.png"
                  return (
                    <tr key={product.id} className="hover:bg-background transition">
                      <td className="p-4 px-6">
                        <div className="relative w-12 h-12 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
                          <Image
                            src={firstImage}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 px-6 font-medium text-foreground">
                        {product.name}
                      </td>
                      <td className="p-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 px-6 font-medium text-foreground">
                        ${product.price.toFixed(2)}
                        {product.mrp > product.price && (
                          <span className="block text-xs line-through text-muted-foreground">
                            ${product.mrp.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 px-6">
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          disabled={actionLoading === product.id}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition ${
                            product.inStock
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          } disabled:opacity-50`}
                        >
                          {product.inStock ? (
                            <>
                              <EyeIcon size={12} />
                              In Stock
                            </>
                          ) : (
                            <>
                              <EyeOffIcon size={12} />
                              Out of Stock
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={actionLoading === product.id}
                          className="p-2 text-destructive hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center"
                          title="Delete Product"
                        >
                          <Trash2Icon size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
