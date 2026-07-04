'use client'
import Link from 'next/link'
import { Users, ChevronRight, Calendar } from 'lucide-react'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import type { Tour, Booking } from '@/types'

const statusColor: Record<string, string> = {
  upcoming: 'bg-emerald-500/15 text-emerald-300',
  ongoing: 'bg-sky-500/15 text-sky-300',
  completed: 'bg-white/10 text-white/60',
  cancelled: 'bg-rose-500/15 text-rose-300',
}

export default function AdminPassengersPage() {
  const { data: tours, loading: toursLoading } = useFetch<Tour[]>('/api/tours', [])
  const { data: bookings, loading: bookingsLoading } = useFetch<Booking[]>('/api/bookings', [])
  const loading = toursLoading || bookingsLoading

  if (loading) return <AdminLoading />

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
      <AdminHeader title="Passengers" description="View and manage passenger attendance per tour." />

      {toursWithCounts.length === 0 ? (
        <EmptyState icon={Users} title="No tours with registrations yet" description="Once travellers book a tour, its passenger manifest appears here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {toursWithCounts.map((tour) => (
            <Link key={tour._id} href={`/admin/passengers/${tour._id}`} className="hover-lift group rounded-3xl glass gilt-border p-6 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1 truncate">{tour.title}</h3>
                <div className="flex items-center gap-1 text-xs text-white/45 mb-2"><Calendar size={11} />{new Date(tour.startDate).toLocaleDateString('en-IN')}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-sky-300 font-medium">{tour.totalBookings} Bookings</span>
                  <span className="text-gilt-300 font-medium">{tour.totalPassengers} Passengers</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[tour.status]}`}>{tour.status}</span>
                <ChevronRight size={18} className="text-gilt-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
