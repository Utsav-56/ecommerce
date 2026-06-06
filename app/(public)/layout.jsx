'use client'
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }) {
    return (
        <div className="bg-background text-foreground relative">
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    )
}
