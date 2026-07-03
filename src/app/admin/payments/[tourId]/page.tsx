'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Phone, CheckCircle2, XCircle, Download, Image as ImageIcon, Printer, IndianRupee } from 'lucide-react'
import { downloadCSV, bookingsToRows } from '@/lib/export'
import type { Tour, Booking } from '@/types'
import PaymentStatusBadge from '@/features/payments/components/PaymentStatusBadge'

export default function TourPaymentsPage() {
  const { tourId } = useParams() as { tourId: string }
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [viewShot, setViewShot] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [edit, setEdit] = useState({ amountPaid: '', paymentRef: '', paymentNote: '' })

  async function load() {
    const [tr, bk] = await Promise.all([
      fetch(`/api/tours/${tourId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/tours/${tourId}/bookings`).then((r) => (r.ok ? r.json() : [])),
    ])
    setTour(tr)
    setBookings(Array.isArray(bk) ? bk : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [tourId]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  async function updatePayment(id: string, data: Record<string, unknown>) {
    setBusy(id)
    await fetch(`/api/bookings/${id}/payment`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    await load()
    setBusy(null)
  }

  function startEdit(b: Booking) {
    setEditId(b._id)
    setEdit({ amountPaid: String(b.amountPaid || ''), paymentRef: b.paymentRef || '', paymentNote: b.paymentNote || '' })
  }
  async function saveEdit(id: string) {
    await updatePayment(id, { amountPaid: Number(edit.amountPaid) || 0, paymentRef: edit.paymentRef, paymentNote: edit.paymentNote })
    setEditId(null)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const expected = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0)
  const collected = bookings.reduce((s, b) => s + (b.paymentStatus === 'confirmed' ? b.amountPaid || 0 : 0), 0)
  const pendingAmt = expected - collected
  const toVerify = bookings.filter((b) => b.paymentStatus === 'screenshot_received').length

  function exportCsv() {
    const safe = (tour?.title || 'trip').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    downloadCSV(`payments-${safe}`, bookingsToRows(bookings))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{tour?.title || 'Trip'} — Payments</h1>
          <p className="text-gray-500 text-sm">{tour ? new Date(tour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}><Download size={14} className="mr-1" /> Excel/CSV</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}><Printer size={14} className="mr-1" /> Print/PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Expected', value: expected, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Collected', value: collected, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Pending Amount', value: pendingAmt, color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map((s, i) => (
          <div key={i} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="text-xl font-bold flex items-center"><IndianRupee size={15} />{s.value.toLocaleString()}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
        <div className="border rounded-xl p-4 bg-orange-50 border-orange-200 text-orange-700">
          <div className="text-xl font-bold">{toVerify}</div>
          <div className="text-xs font-medium mt-1">Screenshots to Verify</div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No registrations for this trip yet</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <span className="text-xs font-mono text-gray-400">{b.bookingRef}</span>
                    {b.isWalkIn && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Walk-in</span>}
                  </div>
                  <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-orange-600 mt-0.5"><Phone size={11} />{b.phone}</a>
                  <div className="text-xs text-gray-400 mt-1">{b.passengers?.length || b.numPersons} passenger(s)</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total <span className="font-semibold text-gray-800">₹{(b.totalAmount || 0).toLocaleString()}</span></div>
                  <div className="text-sm text-gray-500">Paid <span className="font-semibold text-green-600">₹{(b.amountPaid || 0).toLocaleString()}</span></div>
                  <div className="mt-1"><PaymentStatusBadge status={b.paymentStatus} /></div>
                </div>
              </div>

              {b.paymentRef && <div className="text-xs text-gray-500 mt-2">Ref: <span className="font-mono">{b.paymentRef}</span></div>}
              {b.paymentNote && <div className="text-xs text-gray-500 italic mt-1">{b.paymentNote}</div>}

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {b.paymentScreenshot ? (
                  <button onClick={() => setViewShot(b.paymentScreenshot!)} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <ImageIcon size={13} /> View Screenshot
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><ImageIcon size={13} /> No screenshot</span>
                )}
                <div className="flex-1" />
                {b.paymentStatus !== 'confirmed' && (
                  <Button size="sm" disabled={busy === b._id} onClick={() => updatePayment(b._id, { paymentStatus: 'confirmed', amountPaid: b.amountPaid || b.totalAmount || 0, status: 'confirmed' })} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 size={14} className="mr-1" /> Confirm
                  </Button>
                )}
                {b.paymentStatus !== 'rejected' && (
                  <Button size="sm" variant="destructive" disabled={busy === b._id} onClick={() => updatePayment(b._id, { paymentStatus: 'rejected' })}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}>Edit</Button>
              </div>

              {editId === b._id && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" type="number" placeholder="Amount paid" value={edit.amountPaid} onChange={(e) => setEdit({ ...edit, amountPaid: e.target.value })} />
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Payment ref / UTR" value={edit.paymentRef} onChange={(e) => setEdit({ ...edit, paymentRef: e.target.value })} />
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Note" value={edit.paymentNote} onChange={(e) => setEdit({ ...edit, paymentNote: e.target.value })} />
                  <div className="sm:col-span-3 flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(b._id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewShot && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewShot(null)}>
          <div className="bg-white rounded-xl p-3 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Screenshot</span>
              <button onClick={() => setViewShot(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>
            <img src={viewShot} alt="Payment screenshot" className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
