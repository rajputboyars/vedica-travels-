import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'

async function getTours() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tours`, { cache: 'no-store' })
    const tours = await res.json()
    return Array.isArray(tours) ? tours : []
  } catch {
    return []
  }
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function ToursPage() {
  const tours = await getTours()
  const upcoming = tours.filter((t: any) => t.status === 'upcoming')
  const past = tours.filter((t: any) => t.status === 'completed')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">All Yatras</h1>
        <p className="text-orange-100">Sacred pilgrimages with Vedika Spiritual Travels</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Upcoming */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🛕 Upcoming Yatras</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl mb-12">
            <p className="text-lg">New yatras coming soon. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {upcoming.map((tour: any) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Completed Yatras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((tour: any) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TourCard({ tour }: { tour: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="h-48 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center relative">
        {tour.image ? (
          <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">🛕</span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${statusColors[tour.status] || 'bg-gray-100'}`}>
          {tour.status}
        </span>
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600">{tour.title}</h3>
        <p className="text-sm text-orange-600 mb-3 flex items-center gap-1"><MapPin size={13} />{tour.route}</p>
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
