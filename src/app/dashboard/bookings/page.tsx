'use client'
import Link from 'next/link'
import { ChevronRight, ClipboardList } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import EmptyState from '@/components/lux/EmptyState'
import { bookingStatusMeta, paymentStatusMeta, seatStatusMeta, statusBadge } from '@/config/registration-status'
import type { Registration } from '@/types'

// Phase 9 — "View Bookings" / "Booking History". Single fetch of
// /api/registrations/mine covers both current and past bookings.
export default function MyBookingsPage() {
  const { data: registrations, loading } = useFetch<Registration[]>('/api/registrations/mine', [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">My Bookings</h1>
        <p className="mt-1 text-white/55">{registrations.length} booking(s)</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/40">Loading…</div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No bookings yet" description="You haven't registered for any packages yet." action={{ label: 'Browse packages', href: '/packages' }} />
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <Link
              key={r._id}
              href={`/dashboard/bookings/${r._id}`}
              className="hover-lift flex items-center justify-between gap-3 rounded-2xl glass gilt-border p-5 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{r.packageTitle}</span>
                  <span className="text-xs font-mono text-white/35">{r.bookingId}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className={statusBadge(bookingStatusMeta[r.status]).className}>{bookingStatusMeta[r.status].label}</span>
                  <span className={statusBadge(paymentStatusMeta[r.paymentStatus]).className}>{paymentStatusMeta[r.paymentStatus].label}</span>
                  <span className={statusBadge(seatStatusMeta[r.seatStatus]).className}>{seatStatusMeta[r.seatStatus].label}</span>
                </div>
                <div className="text-xs text-white/40 mt-2">
                  {new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.numPersons} person(s)
                </div>
              </div>
              <ChevronRight size={18} className="text-gilt-400 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
