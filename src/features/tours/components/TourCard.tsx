import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { categoryMeta, resolveCategory } from '@/config/theme'
import type { Tour } from '@/types'
import TourImage from './TourImage'

// One card component shared by the homepage showcase, the tours listing,
// and (in a "compact" variant) anywhere else a tour teaser is needed —
// the original app had two near-identical copies of this JSX.
export default function TourCard({ tour, variant = 'default' }: { tour: Tour; variant?: 'default' | 'compact' }) {
  const meta = categoryMeta[resolveCategory(tour.category)]
  const seatsLow = tour.availableSeats <= 10

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group pt-0">
      <div className={variant === 'compact' ? 'h-48 relative overflow-hidden' : 'h-52 relative overflow-hidden'}>
        <TourImage
          src={tour.image}
          alt={tour.title}
          category={tour.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {variant === 'default' ? (
          <>
            <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white ${meta.badgeClass}`}>
              {meta.emoji} {meta.label}
            </span>
            {seatsLow && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white animate-pulse">
                Only {tour.availableSeats} seats!
              </span>
            )}
          </>
        ) : (
          <Badge className="absolute top-3 right-3 capitalize">{tour.status}</Badge>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 line-clamp-1">{tour.title}</h3>
        <p className="text-sm text-orange-600 mb-3 flex items-center gap-1">
          <MapPin size={13} className="shrink-0" /><span className="line-clamp-1">{tour.route}</span>
        </p>
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} /> {new Date(tour.startDate).toLocaleDateString('en-IN')}
            {variant === 'default' && <> – {new Date(tour.endDate).toLocaleDateString('en-IN')}</>}
          </div>
          <div className="flex items-center gap-1.5"><Clock size={13} /> Departure: {tour.departureTime}</div>
          {variant === 'default' && (
            <div className="flex items-center gap-1.5"><Users size={13} /> {tour.availableSeats} seats available</div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">
            ₹{tour.price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span>
          </div>
          <Link href={`/tours/${tour._id}`}>
            <Button size="sm">{variant === 'default' ? <>Details <ArrowRight size={13} className="ml-1" /></> : 'Book Now'}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
