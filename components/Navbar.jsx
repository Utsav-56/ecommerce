'use client'
import { Search, ShoppingCart, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutAction } from "@/lib/actions/auth";
import { clearUser } from "@/lib/features/auth/authSlice";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [search, setSearch] = useState('');
    const cartCount = useSelector(state => state.cart.total);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    const handleLogout = async () => {
        const res = await logoutAction();
        if (res.success) {
            dispatch(clearUser());
            toast.success("Logged out successfully.");
            router.push('/');
        } else {
            toast.error("Logout failed.");
        }
    };

    return (
        <nav className="relative bg-background border-b border-border transition-colors duration-300">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-foreground">
                        <span className="text-primary">go</span>cart<span className="text-primary text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-primary-foreground bg-primary">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-foreground/80">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-muted px-4 py-3 rounded-full">
                            <Search size={18} className="text-muted-foreground" />
                            <input className="w-full bg-transparent outline-none placeholder-muted-foreground text-foreground" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 hover:text-primary transition-colors">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-primary-foreground bg-primary size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        
                        {mounted && (
                            <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-foreground">Hi, {user.name}</span>
                                {user.role === 'ADMIN' ? (
                                    <Link href="/admin" className="px-4 py-1.5 border border-primary text-primary hover:bg-primary/10 rounded-full transition text-sm">
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
                                <button onClick={handleLogout} className="px-6 py-2 bg-destructive hover:bg-destructive/90 text-sm transition text-destructive-foreground rounded-full cursor-pointer">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => router.push('/login')} className="px-8 py-2 bg-primary hover:bg-primary/90 transition text-primary-foreground rounded-full cursor-pointer">
                                Login
                            </button>
                        )}

                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden flex items-center gap-2">
                        {mounted && (
                            <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        )}
                        {user ? (
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
                                <button onClick={handleLogout} className="px-4 py-1.5 bg-destructive text-xs transition text-destructive-foreground rounded-full">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => router.push('/login')} className="px-7 py-1.5 bg-primary hover:bg-primary/90 text-sm transition text-primary-foreground rounded-full">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar