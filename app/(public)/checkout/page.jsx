'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { PlusIcon, SquarePenIcon, XIcon, CheckCircle2Icon } from "lucide-react"
import Image from "next/image"
import AddressModal from "@/components/AddressModal"
import { placeOrderAction, validateCouponAction } from "@/lib/actions/orders"
import { clearCart } from "@/lib/features/cart/cartSlice"

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
  
  const { cartItems } = useSelector(state => state.cart)
  const products = useSelector(state => state.product.list)
  const addressList = useSelector(state => state.address.list)
  const { user } = useSelector(state => state.auth)

  const [cartArray, setCartArray] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [coupon, setCoupon] = useState(null)
  const [loading, setLoading] = useState(false)

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, router])

  // Sync cart items from Redux
  useEffect(() => {
    let total = 0
    const arr = []
    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find(p => p.id === key)
      if (product) {
        arr.push({
          ...product,
          quantity: value,
        })
        total += product.price * value
      }
    }
    setCartArray(arr)
    setTotalPrice(total)

    // Redirect to cart if empty
    if (products.length > 0 && arr.length === 0) {
      toast.error("Your cart is empty.")
      router.push('/cart')
    }
  }, [cartItems, products, router])

  // Automatically select the first address if available
  useEffect(() => {
    if (addressList.length > 0 && !selectedAddress) {
      setSelectedAddress(addressList[0])
    }
  }, [addressList, selectedAddress])

  const handleCouponCode = async (e) => {
    e.preventDefault()
    if (!couponCodeInput) return
    try {
      const res = await validateCouponAction(couponCodeInput)
      if (res.success) {
        setCoupon(res.coupon)
        toast.success("Coupon applied successfully!")
      } else {
        toast.error(res.error || "Invalid or expired coupon.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to validate coupon.")
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error("Please select or add a shipping address.")
    }
    if (!paymentMethod) {
      return toast.error("Please select a payment method.")
    }

    setLoading(true)
    const discount = coupon ? (coupon.discount / 100 * totalPrice) : 0
    const total = totalPrice - discount

    const items = cartArray.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }))

    try {
      const res = await placeOrderAction({
        total,
        addressId: selectedAddress.id,
        paymentMethod,
        couponCode: coupon ? coupon.code : "",
        couponDiscount: discount,
        cartItems: items
      })

      if (res.success) {
        dispatch(clearCart())
        toast.success(paymentMethod === 'COD' ? "Order placed successfully!" : "Order placed! Proceeding to payment...")
        if (res.redirectUrl) {
          router.push(res.redirectUrl)
        } else {
          router.push('/profile')
        }
      } else {
        toast.error(res.error || "Failed to place order.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while placing order.")
    } finally {
      setLoading(false)
    }
  }

  const discount = coupon ? (coupon.discount / 100 * totalPrice) : 0
  const finalTotal = totalPrice - discount

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 text-slate-650">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns - Form Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
                Shipping Address
                <button 
                  onClick={() => setShowAddressModal(true)} 
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon size={14} /> Add Address
                </button>
              </h3>

              {addressList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addressList.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id
                    return (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`border rounded-xl p-4 cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/20 text-slate-800' 
                            : 'border-slate-200 hover:border-slate-350 bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{addr.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{addr.street}, {addr.city}</p>
                          <p className="text-xs text-slate-500">{addr.state}, {addr.zip} - {addr.country}</p>
                          <p className="text-xs text-slate-500 mt-2 font-medium">📞 {addr.phone}</p>
                        </div>
                        {isSelected && (
                          <span className="absolute top-3 right-3 text-indigo-600">
                            <CheckCircle2Icon size={18} />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-sm text-slate-400">No addresses saved. Add one to checkout.</p>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* eSewa */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "ESEWA" 
                    ? "border-emerald-500 bg-emerald-50/20" 
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="ESEWA"
                      checked={paymentMethod === "ESEWA"}
                      onChange={() => setPaymentMethod("ESEWA")}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-850">eSewa</p>
                      <p className="text-xs text-slate-400">Local Wallet</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">NP</span>
                </label>

                {/* Khalti */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "KHALTI" 
                    ? "border-purple-500 bg-purple-50/20" 
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="KHALTI"
                      checked={paymentMethod === "KHALTI"}
                      onChange={() => setPaymentMethod("KHALTI")}
                      className="accent-purple-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-850">Khalti</p>
                      <p className="text-xs text-slate-400">Local Wallet</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded">NP</span>
                </label>

                {/* Stripe */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "STRIPE" 
                    ? "border-indigo-500 bg-indigo-50/20" 
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="STRIPE"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-850">Stripe</p>
                      <p className="text-xs text-slate-400">International Card</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded">INTL</span>
                </label>

                {/* PayPal */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "PAYPAL" 
                    ? "border-blue-500 bg-blue-50/20" 
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="PAYPAL"
                      checked={paymentMethod === "PAYPAL"}
                      onChange={() => setPaymentMethod("PAYPAL")}
                      className="accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-850">PayPal</p>
                      <p className="text-xs text-slate-400">International Wallet</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded">INTL</span>
                </label>

                {/* COD */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "COD" 
                    ? "border-slate-500 bg-slate-50" 
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="accent-slate-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-850">Cash on Delivery</p>
                      <p className="text-xs text-slate-400">Pay on Hand</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">COD</span>
                </label>

              </div>
            </div>

            {/* Review Items */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Review Order Items</h3>
              
              <div className="divide-y divide-slate-100">
                {cartArray.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="size-16 rounded-lg bg-slate-100 border border-slate-150 flex items-center justify-center shrink-0">
                      <Image 
                        src={item.images[0] || "/placeholder.png"} 
                        alt={item.name} 
                        width={40} 
                        height={40} 
                        className="object-cover h-10 w-auto"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                      <p className="text-xs text-slate-500 mt-1">{currency}{item.price} × {item.quantity}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-800">
                      {currency}{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Payment Summary Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-slate-800 mb-5">Checkout Summary</h3>
              
              {/* Cost Rows */}
              <div className="space-y-3 pb-5 border-b border-slate-150 text-sm">
                <div className="flex justify-between text-slate-500">
                  <p>Subtotal:</p>
                  <p className="font-semibold text-slate-800">{currency}{totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-slate-500">
                  <p>Shipping:</p>
                  <p className="text-emerald-600 font-semibold">Free</p>
                </div>
                {coupon && (
                  <div className="flex justify-between text-slate-500">
                    <p>Coupon Discount:</p>
                    <p className="text-emerald-600 font-semibold">-{currency}{discount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Coupon Form */}
              <div className="py-4 border-b border-slate-150">
                {!coupon ? (
                  <form onSubmit={handleCouponCode} className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Coupon Code"
                      className="w-full border border-slate-200 rounded-lg p-2 px-3 outline-none text-sm focus:border-indigo-500 bg-slate-50 focus:bg-white transition"
                    />
                    <button className="bg-slate-700 hover:bg-slate-850 text-white text-xs font-semibold px-4 rounded-lg transition active:scale-95 cursor-pointer">
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-150 p-2.5 rounded-lg text-indigo-750 text-xs">
                    <div>
                      <p className="font-bold">Code: {coupon.code.toUpperCase()}</p>
                      <p className="text-slate-450 mt-0.5">{coupon.description} ({coupon.discount}% Off)</p>
                    </div>
                    <button 
                      onClick={() => setCoupon(null)} 
                      className="text-slate-400 hover:text-red-650 transition cursor-pointer"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="flex justify-between py-5 text-slate-850 font-bold">
                <p className="text-base">Order Total:</p>
                <p className="text-xl">{currency}{finalTotal.toFixed(2)}</p>
              </div>

              {/* Checkout Trigger */}
              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-indigo-650 hover:bg-indigo-750 text-white py-3 rounded-xl font-semibold transition active:scale-97 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  paymentMethod === "COD" ? "Place Order (COD)" : "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
    </div>
  )
}
