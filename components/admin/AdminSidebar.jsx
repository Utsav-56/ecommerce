'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, PlusIcon, PackageIcon, UsersIcon, TicketPercentIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useSelector } from "react-redux"

const AdminSidebar = () => {
    const pathname = usePathname()
    const { user } = useSelector(state => state.auth)

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Add Product', href: '/admin/add-product', icon: PlusIcon },
        { name: 'Manage Products', href: '/admin/manage-products', icon: PackageIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon  },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-border sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={assets.gs_logo} alt="" width={80} height={80} />
                <p className="text-foreground font-medium">Hi, {user ? user.name : 'Admin'}</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-muted-foreground hover:bg-background p-2.5 transition ${pathname === link.href && 'bg-muted sm:text-muted-foreground'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-primary right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar