'use client'
import Link from "next/link"

const AdminNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-border transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-foreground">
                <span className="text-primary">go</span>cart<span className="text-primary text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-primary-foreground bg-primary">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, Admin</p>
            </div>
        </div>
    )
}

export default AdminNavbar