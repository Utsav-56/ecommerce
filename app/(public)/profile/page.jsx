'use client'
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { getPurchasesAction } from "@/lib/actions/purchases"
import { UserIcon, MailIcon, MapPinIcon, CalendarIcon, ShoppingBagIcon } from "lucide-react"
import Image from "next/image"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)

  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile')
    }
  }, [user, router])

  const fetchPurchases = async () => {
    try {
      const res = await getPurchasesAction()
      if (res.success) {
        setPurchases(res.list)
      } else {
        toast.error(res.error || "Failed to load purchase history.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load purchase history.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPurchases()
    }
  }, [user])

  if (loading) return <Loading />

  // Payment Badge Color Mapping
  const getPaymentBadge = (method) => {
    const styles = {
      ESEWA: "bg-emerald-50 text-emerald-700 border-emerald-200",
      KHALTI: "bg-purple-50 text-purple-700 border-purple-200",
      STRIPE: "bg-indigo-50 text-indigo-700 border-indigo-200",
      PAYPAL: "bg-blue-50 text-blue-700 border-blue-200",
      COD: "bg-slate-50 text-slate-700 border-slate-200"
    }
    const styleClass = styles[method] || "bg-slate-50 text-slate-600 border-slate-200"
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}>
        {method}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 text-slate-650">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

        {/* Profile Details Card */}
        {user && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-805 flex items-center gap-1.5">
                  <UserIcon size={16} className="text-slate-400" />
                  {user.name}
                  {user.role === 'ADMIN' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded ml-2">
                      Admin
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <MailIcon size={14} className="text-slate-400" />
                  {user.email}
                </p>
              </div>
            </div>

            {user.address && (
              <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8 flex items-start gap-2 max-w-sm">
                <MapPinIcon size={16} className="text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Shipping Address</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{user.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase History */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-150 flex items-center gap-2 bg-slate-50/50">
            <ShoppingBagIcon size={20} className="text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-800">Purchase History</h3>
            <span className="text-xs font-normal text-slate-400 ml-1">({purchases.length} items purchased)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                  <th className="p-4 px-6">Product</th>
                  <th className="p-4 px-6">Category</th>
                  <th className="p-4 px-6 text-center">Quantity</th>
                  <th className="p-4 px-6">Price Paid</th>
                  <th className="p-4 px-6">Payment Method</th>
                  <th className="p-4 px-6">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      No purchases found. Shop some products to build your history!
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => {
                    const firstImage = purchase.product.images?.[0] || "/placeholder.png"
                    return (
                      <tr key={purchase.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 px-6 flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                            <Image
                              src={firstImage}
                              alt={purchase.product.name}
                              width={38}
                              height={38}
                              className="object-cover h-10 w-auto"
                            />
                          </div>
                          <span className="font-semibold text-slate-800 hover:text-indigo-650 transition cursor-pointer" onClick={() => router.push(`/product/${purchase.product.id}`)}>
                            {purchase.product.name}
                          </span>
                        </td>
                        <td className="p-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {purchase.product.category}
                          </span>
                        </td>
                        <td className="p-4 px-6 text-center font-medium text-slate-700">
                          {purchase.quantity}
                        </td>
                        <td className="p-4 px-6 font-semibold text-slate-800">
                          ${(purchase.pricePaid * purchase.quantity).toFixed(2)}
                          {purchase.quantity > 1 && (
                            <span className="block text-xs font-normal text-slate-400">
                              (${(purchase.pricePaid).toFixed(2)} each)
                            </span>
                          )}
                        </td>
                        <td className="p-4 px-6">
                          {getPaymentBadge(purchase.paymentMethod)}
                        </td>
                        <td className="p-4 px-6 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon size={13} className="text-slate-350" />
                            {new Date(purchase.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
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
    </div>
  )
}
