import Link from 'next/link'
import { CalendarDays, Users, ArrowUpRight, MapPin } from 'lucide-react'
import { packageCategoryMeta } from '@/config/package-theme'
import type { Package } from '@/types'

// Premium package card matching LuxTourCard — dark glass, gilt border,
// image zoom on hover, gold pricing. Shown on /packages and category pages.
export default function LuxPackageCard({ pkg }: { pkg: Package }) {
  const meta = packageCategoryMeta[pkg.category]
  const cover = pkg.images?.[0]

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="hover-lift group relative flex flex-col overflow-hidden rounded-3xl glass gilt-border"
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-ink-700 to-ink-800">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied package image URL, same pattern as TourImage/PackageCard
          <img src={cover} alt={pkg.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/25 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-ink-900/70 backdrop-blur px-3 py-1 text-xs font-medium text-gilt-300 border border-gilt-500/25">
          {meta.emoji} {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-white leading-snug line-clamp-1 group-hover:text-gilt-200 transition-colors">
          {pkg.title}
        </h3>
        {pkg.shortDescription && <p className="mt-2 text-sm text-white/55 line-clamp-2">{pkg.shortDescription}</p>}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-gilt-400" /> {pkg.duration.days}D / {pkg.duration.nights}N</span>
          <span className="flex items-center gap-1.5"><Users size={13} className="text-gilt-400" /> {pkg.totalSeats} seats/batch</span>
          {pkg.pickupPoints?.[0] && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gilt-400" /> Pickup available</span>}
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-5">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Starting from</span>
            <span className="font-display text-2xl font-semibold gilt-text">₹{pkg.price.toLocaleString('en-IN')}</span>
          </div>
          <span className="grid place-items-center w-11 h-11 rounded-full bg-gilt-400 text-ink-900 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  )
}
