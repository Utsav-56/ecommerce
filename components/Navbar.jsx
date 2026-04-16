'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutAction } from "@/lib/actions/auth";
import { clearUser } from "@/lib/features/auth/authSlice";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('');
    const cartCount = useSelector(state => state.cart.total);
    const { user } = useSelector(state => state.auth);

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
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-700">Hi, {user.name}</span>
                                {user.role === 'ADMIN' ? (
                                    <Link href="/admin" className="px-4 py-1.5 border border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-full transition text-sm">
                                        Admin Panel
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/profile" className="text-slate-600 hover:text-indigo-600 transition text-sm">
                                            My Profile
                                        </Link>
                                        <Link href="/orders" className="text-slate-600 hover:text-indigo-600 transition text-sm">
                                            My Orders
                                        </Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-sm transition text-white rounded-full cursor-pointer">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => router.push('/login')} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full cursor-pointer">
                                Login
                            </button>
                        )}

                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'ADMIN' ? (
                                    <Link href="/admin" className="text-xs text-indigo-600 font-medium">
                                        Admin
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/profile" className="text-xs text-slate-600">
                                            Profile
                                        </Link>
                                        <Link href="/orders" className="text-xs text-slate-600">
                                            Orders
                                        </Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="px-4 py-1.5 bg-rose-500 text-xs transition text-white rounded-full">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => router.push('/login')} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar