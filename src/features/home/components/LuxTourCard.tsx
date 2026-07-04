import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users, ArrowUpRight, CalendarDays } from 'lucide-react'
import { categoryMeta, resolveCategory } from '@/config/theme'
import type { Tour } from '@/types'

const FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80&auto=format&fit=crop'

function nights(tour: Tour) {
  const d = Math.round((new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime()) / 86_400_000)
  return Math.max(0, d)
}

// Premium tour card for the home page (featured grid + showcases).
// Dark glass, gilt border, image zoom on hover, gold pricing.
export default function LuxTourCard({ tour }: { tour: Tour }) {
  const meta = categoryMeta[resolveCategory(tour.category)]
  const n = nights(tour)
  const seatsLow = tour.availableSeats <= 10
  const start = new Date(tour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <Link
      href={`/tours/${tour._id}`}
      className="hover-lift group relative flex flex-col overflow-hidden rounded-3xl glass gilt-border"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={tour.image || FALLBACK}
          alt={tour.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/25 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-ink-900/70 backdrop-blur px-3 py-1 text-xs font-medium text-gilt-300 border border-gilt-500/25">
          {meta.emoji} {meta.label}
        </span>
        {seatsLow && (
          <span className="absolute top-4 right-4 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white">
            {tour.availableSeats} seats left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-white leading-snug line-clamp-1 group-hover:text-gilt-200 transition-colors">
          {tour.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/55">
          <MapPin size={14} className="shrink-0 text-gilt-400" />
          <span className="line-clamp-1">{tour.route}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-gilt-400" /> {start}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} className="text-gilt-400" /> {n > 0 ? `${n}N / ${n + 1}D` : 'Day trip'}</span>
          <span className="flex items-center gap-1.5"><Users size={13} className="text-gilt-400" /> {tour.availableSeats} seats</span>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-5">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Starting from</span>
            <span className="font-display text-2xl font-semibold gilt-text">₹{tour.price.toLocaleString('en-IN')}</span>
          </div>
          <span className="grid place-items-center w-11 h-11 rounded-full bg-gilt-400 text-ink-900 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  )
}
