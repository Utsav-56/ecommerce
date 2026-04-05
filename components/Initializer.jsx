'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getCurrentUserAction } from '@/lib/actions/auth'
import { getProductsAction } from '@/lib/actions/products'
import { getCartAction } from '@/lib/actions/cart'
import { getAddressesAction } from '@/lib/actions/address'
import { getRatingsAction } from '@/lib/actions/ratings'
import { setUser, clearUser } from '@/lib/features/auth/authSlice'
import { setProduct } from '@/lib/features/product/productSlice'
import { setCart, clearCart } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import { setRatings } from '@/lib/features/rating/ratingSlice'

export default function Initializer() {
  const dispatch = useDispatch()

  useEffect(() => {
    async function initApp() {
      // 1. Load active session
      const authRes = await getCurrentUserAction()
      if (authRes?.success && authRes.user) {
        dispatch(setUser(authRes.user))
        
        // Load user-specific database data
        const cartRes = await getCartAction()
        if (cartRes?.success) {
          dispatch(setCart({ cartItems: cartRes.cartItems, total: cartRes.total }))
        }
        
        const addrRes = await getAddressesAction()
        if (addrRes?.success) {
          dispatch(setAddresses(addrRes.list))
        }
      } else {
        dispatch(clearUser())
        dispatch(clearCart())
        dispatch(setAddresses([]))
      }

      // 2. Load public database products
      const prodRes = await getProductsAction()
      if (prodRes?.success) {
        dispatch(setProduct(prodRes.products))
      }

      // 3. Load public ratings/reviews
      const ratingRes = await getRatingsAction()
      if (ratingRes?.success) {
        dispatch(setRatings(ratingRes.ratings))
      }
    }

    initApp()
  }, [dispatch])

  return null
}
