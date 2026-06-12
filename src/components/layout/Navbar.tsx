'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">🙏</span>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Vedika Spiritual</div>
              <div className="text-xs text-orange-200 leading-tight">Travels</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-orange-200 transition-colors">Home</Link>
            <Link href="/tours" className="hover:text-orange-200 transition-colors">Tours</Link>
            <Link href="/about" className="hover:text-orange-200 transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-orange-200 transition-colors">Contact</Link>
            <a href="tel:9773834051" className="flex items-center gap-1 bg-white text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors">
              <Phone size={14} />
              9773834051
            </a>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-orange-700 border-t border-orange-500 px-4 py-4 space-y-3 text-sm font-medium">
          <Link href="/" className="block hover:text-orange-200" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/tours" className="block hover:text-orange-200" onClick={() => setOpen(false)}>Tours</Link>
          <Link href="/about" className="block hover:text-orange-200" onClick={() => setOpen(false)}>About Us</Link>
          <Link href="/contact" className="block hover:text-orange-200" onClick={() => setOpen(false)}>Contact</Link>
          <a href="tel:9773834051" className="flex items-center gap-1 text-orange-200">
            <Phone size={14} /> 9773834051
          </a>
        </div>
      )}
    </nav>
  )
}
