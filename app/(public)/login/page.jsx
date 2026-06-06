'use client'
import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { loginAction, getCurrentUserAction } from '@/lib/actions/auth'
import { getCartAction } from '@/lib/actions/cart'
import { getAddressesAction } from '@/lib/actions/address'
import { setUser } from '@/lib/features/auth/authSlice'
import { setCart } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      return toast.error('Please enter email and password.')
    }

    startTransition(async () => {
      const res = await loginAction({ email, password })
      if (!res.success) {
        toast.error(res.error || 'Login failed.')
        return
      }

      toast.success('Logged in successfully!')
      
      // Load user profile & db state
      const userRes = await getCurrentUserAction()
      if (userRes?.success && userRes.user) {
        dispatch(setUser(userRes.user))
        
        // Sync cart
        const cartRes = await getCartAction()
        if (cartRes?.success) {
          dispatch(setCart({ cartItems: cartRes.cartItems, total: cartRes.total }))
        }
        
        // Sync addresses
        const addrRes = await getAddressesAction()
        if (addrRes?.success) {
          dispatch(setAddresses(addrRes.list))
        }
      }

      router.push(redirect)
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-16 bg-background">
      <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-2">Log in to your gocart account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. user@gocart.com" 
              className="w-full p-3 border border-border rounded-lg outline-none focus:border-primary transition text-foreground text-sm"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password" 
              className="w-full p-3 border border-border rounded-lg outline-none focus:border-primary transition text-foreground text-sm"
              required
              disabled={isPending}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-primary hover:bg-indigo-700 text-primary-foreground rounded-lg font-medium transition active:scale-98 disabled:bg-primary cursor-pointer"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  )
}
