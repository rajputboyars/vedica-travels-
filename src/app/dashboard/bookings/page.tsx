'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { bookingStatusMeta, paymentStatusMeta, seatStatusMeta, statusBadge } from '@/config/registration-status'
import type { Registration } from '@/types'

// Phase 9 — "View Bookings" / "Booking History". Single fetch of
// /api/registrations/mine (see registration.service.ts listMyRegistrations)
// covers both "current" and "past" bookings — there's no separate
// history endpoint, just the same list sorted newest-first.
export default function MyBookingsPage() {
  const { data: registrations, loading } = useFetch<Registration[]>('/api/registrations/mine', [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-500 text-sm">{registrations.length} booking(s)</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">
          You haven&apos;t registered for any packages yet.{' '}
          <Link href="/packages" className="text-orange-600 hover:underline">Browse packages</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <Link
              key={r._id}
              href={`/dashboard/bookings/${r._id}`}
              className="flex items-center justify-between gap-3 bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{r.packageTitle}</span>
                  <span className="text-xs font-mono text-gray-400">{r.bookingId}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <span className={statusBadge(bookingStatusMeta[r.status]).className}>{bookingStatusMeta[r.status].label}</span>
                  <span className={statusBadge(paymentStatusMeta[r.paymentStatus]).className}>{paymentStatusMeta[r.paymentStatus].label}</span>
                  <span className={statusBadge(seatStatusMeta[r.seatStatus]).className}>{seatStatusMeta[r.seatStatus].label}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1.5">
                  {new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.numPersons} person(s)
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
