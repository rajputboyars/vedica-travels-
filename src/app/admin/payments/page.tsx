'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IndianRupee, ChevronRight, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminPaymentsPage() {
  const [tours, setTours] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [tr, bk] = await Promise.all([
        fetch('/api/tours').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
      ])
      setTours(Array.isArray(tr) ? tr : [])
      setBookings(Array.isArray(bk) ? bk : [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const rows = tours.map((tour: any) => {
    const tb = bookings.filter((b: any) => b.tourId === tour._id || b.tourId?._id === tour._id)
    const collected = tb.reduce((s: number, b: any) => s + (b.paymentStatus === 'confirmed' ? (b.amountPaid || 0) : 0), 0)
    const expected = tb.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0)
    const pending = tb.filter((b: any) => b.paymentStatus === 'pending' || b.paymentStatus === 'screenshot_received').length
    const toVerify = tb.filter((b: any) => b.paymentStatus === 'screenshot_received').length
    return { ...tour, count: tb.length, collected, expected, pending, toVerify }
  }).filter((t: any) => t.count > 0 || t.status === 'upcoming')

  const totalCollected = rows.reduce((s: number, t: any) => s + t.collected, 0)
  const totalToVerify = rows.reduce((s: number, t: any) => s + t.toVerify, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-500 text-sm">Track and verify payments per trip</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="text-xs text-green-700 font-medium">Total Collected</div>
          <div className="text-2xl font-bold text-green-700 flex items-center"><IndianRupee size={18} />{totalCollected.toLocaleString()}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertCircle size={13} /> Screenshots to Verify</div>
          <div className="text-2xl font-bold text-amber-700">{totalToVerify}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="text-xs text-blue-700 font-medium">Active Trips</div>
          <div className="text-2xl font-bold text-blue-700">{rows.length}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No trips with payments yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((tour: any) => (
            <Link key={tour._id} href={`/admin/payments/${tour._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">{tour.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar size={11} />{new Date(tour.startDate).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600 font-medium">₹{tour.collected.toLocaleString()} collected</span>
                        <span className="text-gray-400">of ₹{tour.expected.toLocaleString()}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 shrink-0" />
                  </div>
                  {tour.toVerify > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      <AlertCircle size={11} /> {tour.toVerify} to verify
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
