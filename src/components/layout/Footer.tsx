import Link from 'next/link'
import { Phone, MapPin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🙏</span>
            <div>
              <div className="text-white font-bold text-lg">Parth Saarthi Travels</div>
              <div className="text-orange-400 text-xs">आपकी सेवा, हमारा सौभाग्य</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">1000+ संतुष्ट तीर्थयात्री। हमारे साथ पवित्र धामों की यात्रा करें।</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
            <li><Link href="/tours" className="hover:text-orange-400 transition-colors">Upcoming Tours</Link></li>
            <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm">
            <a href="tel:9773834051" className="flex items-center gap-2 hover:text-orange-400">
              <Phone size={14} /> 9773834051
            </a>
            <a href="tel:8864910917" className="flex items-center gap-2 hover:text-orange-400">
              <Phone size={14} /> 8864910917
            </a>
            <a href="https://wa.me/919773834051" target="_blank" className="flex items-center gap-2 hover:text-green-400">
              <MessageCircle size={14} /> WhatsApp Us
            </a>
            <div className="flex items-start gap-2 text-gray-400">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>Sector 52, Noida<br/>Metro Pillar No. 657</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © 2026 Parth Saarthi Travels. All rights reserved. | YOGESH THAKUR
      </div>
    </footer>
  )
}
