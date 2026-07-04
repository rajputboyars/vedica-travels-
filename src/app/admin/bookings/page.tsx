'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, User } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { idTypeLabels, type Booking, type BookingStatus } from '@/types'
import AttendanceBadge from '@/features/passengers/components/AttendanceBadge'

const statusColor: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminBookingsPage() {
  const { data: bookings, loading, refetch } = useFetch<Booking[]>('/api/bookings', [])
  const [expanded, setExpanded] = useState<string | null>(null)
  const confirmDialog = useConfirmDialog<Booking>()

  async function updateStatus(id: string, status: BookingStatus) {
    await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    refetch()
  }

  async function handleDelete() {
    await confirmDialog.confirm(async (booking) => {
      await fetch(`/api/bookings/${booking._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  const totalPassengers = bookings.reduce((s, b) => s + (b.passengers?.length || b.numPersons || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 text-sm">{bookings.length} bookings • {totalPassengers} passengers total</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No bookings yet</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="font-medium text-gray-800">{b.name}</div>
                    <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-orange-600 hover:underline mt-0.5">
                      <Phone size={11} />{b.phone}
                    </a>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-gray-500 mx-4 max-w-[180px] truncate">{b.tourTitle}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{b.passengers?.length || b.numPersons} pax</span>
                  {b.totalAmount && <span className="text-sm font-semibold text-orange-600 hidden sm:block">₹{b.totalAmount?.toLocaleString()}</span>}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status]}`}>{b.status}</span>
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
                  <Button size="sm" variant="destructive" onClick={() => confirmDialog.ask(b)}>
                    <Trash2 size={14} />
                  </Button>
                  <button onClick={() => setExpanded(expanded === b._id ? null : b._id)} className="text-gray-400 hover:text-gray-600 p-1">
                    {expanded === b._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === b._id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {b.email && <div><div className="text-gray-400 text-xs mb-0.5">Email</div><div className="font-medium">{b.email}</div></div>}
                    {b.address && <div><div className="text-gray-400 text-xs mb-0.5">Address</div><div className="font-medium">{b.address}</div></div>}
                    {b.emergencyContact && (
                      <div>
                        <div className="text-gray-400 text-xs mb-0.5">Emergency Contact</div>
                        <div className="font-medium">{b.emergencyContact} — {b.emergencyPhone}</div>
                      </div>
                    )}
                    <div><div className="text-gray-400 text-xs mb-0.5">Registered On</div><div className="font-medium">{new Date(b.createdAt).toLocaleDateString('en-IN')}</div></div>
                  </div>

                  {b.message && (
                    <p className="text-sm text-gray-600 italic bg-white rounded-lg p-3 border border-gray-100">&quot;{b.message}&quot;</p>
                  )}

                  {b.passengers?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <User size={14} className="text-orange-600" /> Passenger Details
                      </h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full text-xs bg-white">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">#</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">Name</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">Age</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">Gender</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">ID Type</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">ID Number</th>
                              <th className="text-left px-3 py-2 text-gray-500 font-medium">Attendance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {b.passengers.map((p, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium text-gray-800">{p.name}</td>
                                <td className="px-3 py-2.5 text-gray-600">{p.age}</td>
                                <td className="px-3 py-2.5 text-gray-600 capitalize">{p.gender}</td>
                                <td className="px-3 py-2.5 text-gray-600">{idTypeLabels[p.idType] || p.idType}</td>
                                <td className="px-3 py-2.5 font-mono text-gray-700">{p.idNumber}</td>
                                <td className="px-3 py-2.5"><AttendanceBadge attendance={p.attendance} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this booking?"
        message={confirmDialog.pending ? `${confirmDialog.pending.name}'s booking (${confirmDialog.pending.bookingRef || ''}) will be permanently removed.` : ''}
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
