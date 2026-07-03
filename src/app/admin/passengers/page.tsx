'use client'
import Link from 'next/link'
import { Users, ChevronRight, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useFetch } from '@/hooks/use-fetch'
import type { Tour, Booking } from '@/types'

export default function AdminPassengersPage() {
  const { data: tours, loading: toursLoading } = useFetch<Tour[]>('/api/tours', [])
  const { data: bookings, loading: bookingsLoading } = useFetch<Booking[]>('/api/bookings', [])
  const loading = toursLoading || bookingsLoading

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const toursWithCounts = tours
    .map((tour) => {
      const tourBookings = bookings.filter((b) => b.tourId === tour._id || (b.tourId as unknown as { _id: string })?._id === tour._id)
      const totalPassengers = tourBookings.reduce((sum, b) => sum + (b.passengers?.length || b.numPersons || 0), 0)
      const confirmed = tourBookings.filter((b) => b.status === 'confirmed').length
      return { ...tour, totalBookings: tourBookings.length, totalPassengers, confirmed }
    })
    .filter((t) => t.totalBookings > 0 || t.status === 'upcoming')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Passengers</h1>
        <p className="text-gray-500 text-sm">View and manage passenger attendance per tour</p>
      </div>

      {toursWithCounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tours with registrations yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toursWithCounts.map((tour) => (
            <Link key={tour._id} href={`/admin/passengers/${tour._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{tour.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Calendar size={11} />
                      {new Date(tour.startDate).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600 font-medium">{tour.totalBookings} Bookings</span>
                      <span className="text-orange-600 font-medium">{tour.totalPassengers} Passengers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      tour.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                      tour.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{tour.status}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
