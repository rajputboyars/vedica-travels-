'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchBookings() {
    const res = await fetch('/api/bookings')
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchBookings()
  }

  async function deleteBooking(id: string) {
    if (!confirm('Delete this booking?')) return
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    fetchBookings()
  }

  useEffect(() => { fetchBookings() }, [])

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 text-sm">{bookings.length} total bookings</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No bookings yet</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Tour</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden sm:table-cell">Persons</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">{b.name}</div>
                    <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-orange-600 hover:underline mt-0.5">
                      <Phone size={11} />{b.phone}
                    </a>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                    <div className="max-w-[200px] truncate">{b.tourTitle}</div>
                    <div className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="px-5 py-4 text-center hidden sm:table-cell">{b.numPersons}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      {b.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b._id, 'confirmed')} title="Confirm">
                            <CheckCircle size={15} className="text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b._id, 'cancelled')} title="Cancel">
                            <XCircle size={15} className="text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteBooking(b._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
