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
    let isMounted = true

    async function initApp() {
      // 1. Parallel fetch for public data (products & ratings)
      const [prodRes, ratingRes] = await Promise.all([
        getProductsAction().catch(err => {
          console.error('Failed to load products:', err)
          return { success: false, products: [] }
        }),
        getRatingsAction().catch(err => {
          console.error('Failed to load ratings:', err)
          return { success: false, ratings: [] }
        })
      ])

      if (isMounted) {
        if (prodRes?.success) {
          dispatch(setProduct(prodRes.products))
        }
        if (ratingRes?.success) {
          dispatch(setRatings(ratingRes.ratings))
        }
      }

      // 2. Active user session and user-specific resources
      try {
        const authRes = await getCurrentUserAction()
        if (isMounted) {
          if (authRes?.success && authRes.user) {
            dispatch(setUser(authRes.user))

            // Fetch cart and addresses in parallel for authenticated user
            const [cartRes, addrRes] = await Promise.all([
              getCartAction().catch(() => ({ success: false })),
              getAddressesAction().catch(() => ({ success: false }))
            ])

            if (isMounted) {
              if (cartRes?.success) {
                dispatch(setCart({ cartItems: cartRes.cartItems, total: cartRes.total }))
              }
              if (addrRes?.success) {
                dispatch(setAddresses(addrRes.list))
              }
            }
          } else {
            dispatch(clearUser())
            dispatch(clearCart())
            dispatch(setAddresses([]))
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (isMounted) {
          dispatch(clearUser())
          dispatch(clearCart())
          dispatch(setAddresses([]))
        }
      }
    }

    initApp()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  return null
}
