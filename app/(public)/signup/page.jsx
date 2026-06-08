'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { signupAction, getCurrentUserAction } from '@/lib/actions/auth'
import { getAddressesAction } from '@/lib/actions/address'
import { setUser } from '@/lib/features/auth/authSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

export default function Signup() {
  const router = useRouter()
  const dispatch = useDispatch()

  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      return toast.error('Name, email, and password are required.')
    }

    startTransition(async () => {
      const res = await signupAction({ name, email, password, address })
      if (!res.success) {
        toast.error(res.error || 'Signup failed.')
        return
      }

      toast.success('Account created successfully!')
      
      // Load user profile & sync addresses
      const userRes = await getCurrentUserAction()
      if (userRes?.success && userRes.user) {
        dispatch(setUser(userRes.user))
        
        const addrRes = await getAddressesAction()
        if (addrRes?.success) {
          dispatch(setAddresses(addrRes.list))
        }
      }

      router.push('/')
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-16 bg-background">
      <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground mt-2">Join gocart today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Doe" 
              className="w-full p-3 border border-border rounded-lg outline-none focus:border-primary transition text-foreground text-sm"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. johndoe@example.com" 
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
              placeholder="Min 6 characters" 
              className="w-full p-3 border border-border rounded-lg outline-none focus:border-primary transition text-foreground text-sm"
              required
              minLength={6}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Shipping Address
            </label>
            <textarea 
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your full street address" 
              rows={3}
              className="w-full p-3 border border-border rounded-lg outline-none focus:border-primary transition text-foreground text-sm resize-none"
              disabled={isPending}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-primary hover:bg-indigo-700 text-primary-foreground rounded-lg font-medium transition active:scale-98 disabled:bg-primary cursor-pointer"
            disabled={isPending}
          >
            {isPending ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
