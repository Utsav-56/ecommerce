import { useDispatch } from 'react'
import { setUser, clearUser } from '@/lib/features/auth/authSlice'
import { getCartAction } from '@/lib/actions/cart'
import { getAddressesAction } from '@/lib/actions/address'
import { setCart, clearCart } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'

export function useAuthHydration() {
  const dispatch = useDispatch()

  const hydrateUser = async (user) => {
    if (user) {
      dispatch(setUser(user))

      const [cartRes, addrRes] = await Promise.all([
        getCartAction().catch(() => ({ success: false })),
        getAddressesAction().catch(() => ({ success: false }))
      ])

      if (cartRes?.success) {
        dispatch(setCart({ cartItems: cartRes.cartItems, total: cartRes.total }))
      }
      if (addrRes?.success) {
        dispatch(setAddresses(addrRes.list))
      }
    } else {
      dispatch(clearUser())
      dispatch(clearCart())
      dispatch(setAddresses([]))
    }
  }

  return { hydrateUser }
}
