'use client'
import { Search } from "lucide-react"

export default function SearchForm({ search, setSearch, handleSearch }) {
  return (
    <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-muted px-4 py-3 rounded-full">
      <Search size={18} className="text-muted-foreground" />
      <input
        className="w-full bg-transparent outline-none placeholder-muted-foreground text-foreground"
        type="text"
        placeholder="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        required
      />
    </form>
  )
}
