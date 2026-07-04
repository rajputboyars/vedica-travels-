'use client'
import Link from 'next/link'
import { IndianRupee, ChevronRight, Calendar, AlertCircle } from 'lucide-react'
import { AdminHeader, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import type { Tour, Booking } from '@/types'

export default function AdminPaymentsPage() {
  const { data: tours, loading: toursLoading } = useFetch<Tour[]>('/api/tours', [])
  const { data: bookings, loading: bookingsLoading } = useFetch<Booking[]>('/api/bookings', [])
  const loading = toursLoading || bookingsLoading

  if (loading) return <AdminLoading />

  const rows = tours
    .map((tour) => {
      const tb = bookings.filter((b) => b.tourId === tour._id || (b.tourId as unknown as { _id: string })?._id === tour._id)
      const collected = tb.reduce((s, b) => s + (b.paymentStatus === 'confirmed' ? b.amountPaid || 0 : 0), 0)
      const expected = tb.reduce((s, b) => s + (b.totalAmount || 0), 0)
      const toVerify = tb.filter((b) => b.paymentStatus === 'screenshot_received').length
      return { ...tour, count: tb.length, collected, expected, toVerify }
    })
    .filter((t) => t.count > 0 || t.status === 'upcoming')

  const totalCollected = rows.reduce((s, t) => s + t.collected, 0)
  const totalToVerify = rows.reduce((s, t) => s + t.toVerify, 0)

  const summary = [
    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, tone: 'text-emerald-300', icon: <IndianRupee size={18} /> },
    { label: 'Screenshots to Verify', value: totalToVerify, tone: 'text-amber-300', icon: <AlertCircle size={16} /> },
    { label: 'Active Trips', value: rows.length, tone: 'text-sky-300', icon: null },
  ]

  return (
    <div className="space-y-6">
      <AdminHeader title="Payments" description="Track and verify payments per trip." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-3xl glass gilt-border p-6">
            <div className="text-xs font-medium text-white/50 flex items-center gap-1.5">{s.icon}{s.label}</div>
            <div className={`mt-2 font-display text-3xl font-semibold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass gilt-border text-white/40">No trips with payments yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rows.map((tour) => (
            <Link key={tour._id} href={`/admin/payments/${tour._id}`} className="hover-lift group rounded-3xl glass gilt-border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white mb-1 truncate">{tour.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-white/45 mb-3"><Calendar size={11} />{new Date(tour.startDate).toLocaleDateString('en-IN')}</div>
                  <div className="flex gap-3 text-sm flex-wrap">
                    <span className="text-emerald-300 font-medium">₹{tour.collected.toLocaleString()} collected</span>
                    <span className="text-white/40">of ₹{tour.expected.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gilt-400 shrink-0" />
              </div>
              {tour.toVerify > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full font-medium">
                  <AlertCircle size={11} /> {tour.toVerify} to verify
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
