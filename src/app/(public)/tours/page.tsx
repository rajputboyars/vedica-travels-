'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'
import TourImage from '@/components/ui/tour-image'

type Cat = 'all' | 'spiritual' | 'leisure'

const tabs: { key: Cat; label: string }[] = [
  { key: 'all', label: 'All Trips' },
  { key: 'spiritual', label: '🛕 Spiritual Yatras' },
  { key: 'leisure', label: '🏔️ Holiday Trips' },
]

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading trips...</div>}>
      <ToursInner />
    </Suspense>
  )
}

function ToursInner() {
  const params = useSearchParams()
  const initial = (params.get('cat') as Cat) || 'all'
  const [tours, setTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState<Cat>(['spiritual', 'leisure'].includes(initial) ? initial : 'all')

  useEffect(() => {
    fetch('/api/tours').then(r => r.json()).then(d => {
      setTours(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const visible = tours.filter(t => cat === 'all' || (t.category || 'spiritual') === cat)
  const upcoming = visible.filter(t => t.status === 'upcoming' || t.status === 'ongoing')
  const past = visible.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-orange-600 to-amber-500" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Explore Our Trips</h1>
          <p className="text-orange-100 text-lg">Spiritual yatras & holiday getaways — handpicked for you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setCat(t.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                cat === t.key ? 'bg-orange-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading trips...</div>
        ) : (
          <>
            {upcoming.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl mb-12">
                <p className="text-lg">No trips in this category yet. Check back shortly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {upcoming.map(tour => <TourCard key={tour._id} tour={tour} />)}
              </div>
            )}

            {past.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Completed Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map(tour => <TourCard key={tour._id} tour={tour} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TourCard({ tour }: { tour: any }) {
  const isLeisure = (tour.category || 'spiritual') === 'leisure'
  const seatLow = tour.availableSeats <= 10
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group pt-0">
      <div className="h-52 relative overflow-hidden">
        <TourImage src={tour.image} alt={tour.title} category={tour.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white ${isLeisure ? 'bg-emerald-600' : 'bg-orange-600'}`}>
          {isLeisure ? '🏔️ Holiday Trip' : '🛕 Spiritual Yatra'}
        </span>
        {seatLow && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white animate-pulse">
            Only {tour.availableSeats} seats!
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 line-clamp-1">{tour.title}</h3>
        <p className="text-sm text-orange-600 mb-3 flex items-center gap-1"><MapPin size={13} className="shrink-0" /><span className="line-clamp-1">{tour.route}</span></p>
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(tour.startDate).toLocaleDateString('en-IN')} – {new Date(tour.endDate).toLocaleDateString('en-IN')}</div>
          <div className="flex items-center gap-1.5"><Clock size={13} /> Departure: {tour.departureTime}</div>
          <div className="flex items-center gap-1.5"><Users size={13} /> {tour.availableSeats} seats available</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">₹{tour.price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span></div>
          <Link href={`/tours/${tour._id}`}>
            <Button size="sm">Details <ArrowRight size={13} className="ml-1" /></Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
