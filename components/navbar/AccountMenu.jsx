'use client'
import Link from "next/link"

export default function AccountMenu({ user, handleLogout, router, isMobile = false }) {
  if (isMobile) {
    if (!user) {
      return (
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="px-7 py-1.5 bg-primary hover:bg-primary/90 text-sm transition text-primary-foreground rounded-full"
        >
          Login
        </button>
      )
    }

    return (
      <div className="flex items-center gap-3">
        {user.role === 'ADMIN' ? (
          <Link href="/admin" className="text-xs text-primary font-medium">
            Admin
          </Link>
        ) : (
          <>
            <Link href="/profile" className="text-xs text-foreground/80">
              Profile
            </Link>
            <Link href="/orders" className="text-xs text-foreground/80">
              Orders
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-1.5 bg-destructive text-xs transition text-destructive-foreground rounded-full"
        >
          Logout
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="px-8 py-2 bg-primary hover:bg-primary/90 transition text-primary-foreground rounded-full cursor-pointer"
      >
        Login
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-foreground">Hi, {user.name}</span>
      {user.role === 'ADMIN' ? (
        <Link
          href="/admin"
          className="px-4 py-1.5 border border-primary text-primary hover:bg-primary/10 rounded-full transition text-sm"
        >
          Admin Panel
        </Link>
      ) : (
        <>
          <Link href="/profile" className="hover:text-primary transition text-sm">
            My Profile
          </Link>
          <Link href="/orders" className="hover:text-primary transition text-sm">
            My Orders
          </Link>
        </>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="px-6 py-2 bg-destructive hover:bg-destructive/90 text-sm transition text-destructive-foreground rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  )
}
