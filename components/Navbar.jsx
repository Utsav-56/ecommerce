'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutAction } from "@/lib/actions/auth";
import { clearUser } from "@/lib/features/auth/authSlice";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

import SearchForm from "./navbar/SearchForm";
import CartLink from "./navbar/CartLink";
import ThemeToggle from "./navbar/ThemeToggle";
import AccountMenu from "./navbar/AccountMenu";

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
                        <span className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-primary-foreground bg-primary">
                            plus
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-foreground/80">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>

                        <SearchForm search={search} setSearch={setSearch} handleSearch={handleSearch} />

                        <CartLink cartCount={cartCount} />

                        <ThemeToggle theme={theme} setTheme={setTheme} mounted={mounted} />

                        <AccountMenu user={user} handleLogout={handleLogout} router={router} isMobile={false} />
                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden flex items-center gap-2">
                        <ThemeToggle theme={theme} setTheme={setTheme} mounted={mounted} />
                        <AccountMenu user={user} handleLogout={handleLogout} router={router} isMobile={true} />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar