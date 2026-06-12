import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Phone, MessageCircle, CheckCircle2 } from 'lucide-react'
import BookingForm from './BookingForm'

async function getTour(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tours/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TourDetailPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id)
  if (!tour) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Badge className="mb-3 bg-white/20 border-white/30 text-white">{tour.status}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{tour.title}</h1>
          <p className="text-orange-100 flex items-center gap-2"><MapPin size={16} />{tour.route}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Yatra Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: <Calendar size={16} className="text-orange-600" />, label: 'Start Date', value: new Date(tour.startDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: <Calendar size={16} className="text-orange-600" />, label: 'End Date', value: new Date(tour.endDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: <Clock size={16} className="text-orange-600" />, label: 'Departure Time', value: tour.departureTime },
                { icon: <Users size={16} className="text-orange-600" />, label: 'Available Seats', value: `${tour.availableSeats} of ${tour.totalSeats}` },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-gray-500 text-xs">{item.label}</div>
                    <div className="font-medium text-gray-800">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {tour.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-3">About this Yatra</h2>
              <p className="text-gray-600 leading-relaxed">{tour.description}</p>
            </div>
          )}

          {/* Services */}
          {tour.services?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Services Included</h2>
              <ul className="grid grid-cols-2 gap-2">
                {tour.services.map((s: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inclusions */}
          {tour.inclusions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">What&apos;s Included</h2>
              <ul className="space-y-2">
                {tour.inclusions.map((inc: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-orange-500 shrink-0" />{inc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pickup Points */}
          {tour.pickupPoints?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Pickup Points</h2>
              <ul className="space-y-2">
                {tour.pickupPoints.map((pp: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-orange-500 shrink-0" />{pp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar - Booking */}
        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <div className="text-3xl font-bold text-orange-600 mb-1">₹{tour.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">per person</div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Users size={14} />{tour.availableSeats} seats left
            </div>

            <BookingForm tourId={tour._id} tourTitle={tour.title} />

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <a href="tel:9773834051" className="flex items-center justify-center gap-2 w-full py-2.5 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
                <Phone size={15} /> Call: 9773834051
              </a>
              <a href="https://wa.me/919773834051" target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
