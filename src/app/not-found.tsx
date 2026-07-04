import Link from 'next/link'
import { Compass, ArrowLeft, Home } from 'lucide-react'

// Global 404 — self-contained (renders in the root layout without the
// public navbar/footer), styled in the dark luxury system.
export default function NotFound() {
  return (
    <div className="lux relative min-h-screen flex items-center justify-center overflow-hidden px-6 text-center">
      <div className="aura absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-72 w-72 rounded-full bg-gilt-500/10 blur-3xl" />
      <div className="relative">
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl glass gilt-border text-gilt-300 animate-floaty">
          <Compass size={28} />
        </span>
        <div className="mt-8 font-display text-7xl sm:text-8xl font-semibold gilt-text">404</div>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-white">This path leads nowhere</h1>
        <p className="mt-3 max-w-md mx-auto text-white/55">The page you&apos;re looking for has moved or never existed. Let&apos;s get you back on the journey.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-7 py-3.5 text-sm font-semibold text-ink-900 gilt-glow"><Home size={16} /> Back Home</Link>
          <Link href="/tours" className="inline-flex items-center justify-center gap-2 rounded-full glass gilt-border px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors"><ArrowLeft size={16} className="text-gilt-300" /> Explore Trips</Link>
        </div>
      </div>
    </div>
  )
}
