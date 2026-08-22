'use client'
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle({ theme, setTheme, mounted }) {
  if (!mounted) return null

  return (
    <button 
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
