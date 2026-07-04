'use client'
import { useState } from 'react'
import { Phone, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, User } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, iconBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { idTypeLabels, type Booking, type BookingStatus } from '@/types'
import AttendanceBadge from '@/features/passengers/components/AttendanceBadge'

const statusColor: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300',
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  cancelled: 'bg-rose-500/15 text-rose-300',
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
      <AdminHeader title="Bookings" description={`${bookings.length} bookings • ${totalPassengers} passengers total`} />

      {loading ? (
        <AdminLoading />
      ) : bookings.length === 0 ? (
        <EmptyState icon={User} title="No bookings yet" description="Bookings placed from tour pages will appear here." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="overflow-hidden rounded-3xl glass gilt-border">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="font-medium text-white">{b.name}</div>
                    <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-gilt-300 hover:underline mt-0.5"><Phone size={11} />{b.phone}</a>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-white/50 mx-4 max-w-[180px] truncate">{b.tourTitle}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/40">{b.passengers?.length || b.numPersons} pax</span>
                  {b.totalAmount && <span className="text-sm font-semibold gilt-text hidden sm:block">₹{b.totalAmount?.toLocaleString()}</span>}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[b.status]}`}>{b.status}</span>
                  {b.status === 'pending' && (
                    <>
                      <button className={iconBtn} onClick={() => updateStatus(b._id, 'confirmed')} title="Confirm"><CheckCircle size={16} className="text-emerald-400" /></button>
                      <button className={iconBtn} onClick={() => updateStatus(b._id, 'cancelled')} title="Cancel"><XCircle size={16} className="text-rose-400" /></button>
                    </>
                  )}
                  <button className={dangerIconBtn} onClick={() => confirmDialog.ask(b)} title="Delete"><Trash2 size={15} /></button>
                  <button onClick={() => setExpanded(expanded === b._id ? null : b._id)} className={iconBtn}>
                    {expanded === b._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === b._id && (
                <div className="border-t border-white/5 px-5 py-4 bg-white/[0.02] space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {b.email && <div><div className="text-white/40 text-xs mb-0.5">Email</div><div className="font-medium text-white/85">{b.email}</div></div>}
                    {b.address && <div><div className="text-white/40 text-xs mb-0.5">Address</div><div className="font-medium text-white/85">{b.address}</div></div>}
                    {b.emergencyContact && (
                      <div><div className="text-white/40 text-xs mb-0.5">Emergency Contact</div><div className="font-medium text-white/85">{b.emergencyContact} — {b.emergencyPhone}</div></div>
                    )}
                    <div><div className="text-white/40 text-xs mb-0.5">Registered On</div><div className="font-medium text-white/85">{new Date(b.createdAt).toLocaleDateString('en-IN')}</div></div>
                  </div>

                  {b.message && <p className="text-sm text-white/60 italic bg-white/[0.03] rounded-xl p-3 border border-white/5">&quot;{b.message}&quot;</p>}

                  {b.passengers?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-1.5"><User size={14} className="text-gilt-300" /> Passenger Details</h4>
                      <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-xs">
                          <thead className="bg-white/[0.03] text-white/45">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium">#</th>
                              <th className="text-left px-3 py-2 font-medium">Name</th>
                              <th className="text-left px-3 py-2 font-medium">Age</th>
                              <th className="text-left px-3 py-2 font-medium">Gender</th>
                              <th className="text-left px-3 py-2 font-medium">ID Type</th>
                              <th className="text-left px-3 py-2 font-medium">ID Number</th>
                              <th className="text-left px-3 py-2 font-medium">Attendance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {b.passengers.map((p, i) => (
                              <tr key={i} className="border-t border-white/5">
                                <td className="px-3 py-2.5 text-white/40">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium text-white">{p.name}</td>
                                <td className="px-3 py-2.5 text-white/60">{p.age}</td>
                                <td className="px-3 py-2.5 text-white/60 capitalize">{p.gender}</td>
                                <td className="px-3 py-2.5 text-white/60">{idTypeLabels[p.idType] || p.idType}</td>
                                <td className="px-3 py-2.5 font-mono text-white/70">{p.idNumber}</td>
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
