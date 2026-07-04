import Link from 'next/link'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { packageCategoryMeta } from '@/config/package-theme'
import type { Package } from '@/types'

// Public-facing package teaser — the admin list row in
// app/admin/packages/page.tsx is a different, denser table view; this is
// the customer-facing card shown on /packages and the homepage.
export default function PackageCard({ pkg }: { pkg: Package }) {
  const meta = packageCategoryMeta[pkg.category]
  const cover = pkg.images?.[0]

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group pt-0">
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- consistent with TourCard/TourImage's existing use of plain <img> for admin-supplied URLs
          <img src={cover} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-gray-800 ${meta.badgeClass}`}>
          {meta.emoji} {meta.label}
        </span>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 line-clamp-1">{pkg.title}</h3>
        {pkg.shortDescription && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.shortDescription}</p>}
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} /> {pkg.duration.days} Days / {pkg.duration.nights} Nights
          </div>
          <div className="flex items-center gap-1.5"><Users size={13} /> Up to {pkg.totalSeats} seats per batch</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">
            ₹{pkg.price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span>
          </div>
          <Link href={`/packages/${pkg.slug}`}>
            <Button size="sm">Details <ArrowRight size={13} className="ml-1" /></Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
