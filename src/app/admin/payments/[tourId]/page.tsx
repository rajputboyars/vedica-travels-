'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, CheckCircle2, XCircle, Download, Image as ImageIcon, Printer, IndianRupee } from 'lucide-react'
import { ghostBtn, adminControl, AdminLoading } from '@/features/admin/components/ui'
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
    await fetch(`/api/bookings/${id}/payment`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
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

  if (loading) return <AdminLoading />

  const expected = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0)
  const collected = bookings.reduce((s, b) => s + (b.paymentStatus === 'confirmed' ? b.amountPaid || 0 : 0), 0)
  const pendingAmt = expected - collected
  const toVerify = bookings.filter((b) => b.paymentStatus === 'screenshot_received').length

  function exportCsv() {
    const safe = (tour?.title || 'trip').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    downloadCSV(`payments-${safe}`, bookingsToRows(bookings))
  }

  const summary = [
    { label: 'Expected', value: expected, tone: 'text-sky-300' },
    { label: 'Collected', value: collected, tone: 'text-emerald-300' },
    { label: 'Pending Amount', value: pendingAmt, tone: 'text-amber-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="grid place-items-center w-9 h-9 rounded-lg text-white/60 hover:bg-white/5 hover:text-white"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{tour?.title || 'Trip'} — Payments</h1>
          <p className="text-white/50 text-sm">{tour ? new Date(tour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
        </div>
        <div className="flex gap-2">
          <button className={ghostBtn} onClick={exportCsv}><Download size={14} /> Excel/CSV</button>
          <button className={ghostBtn} onClick={() => window.print()}><Printer size={14} /> Print/PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((s, i) => (
          <div key={i} className="rounded-3xl glass gilt-border p-5">
            <div className={`text-xl font-semibold flex items-center ${s.tone}`}><IndianRupee size={15} />{s.value.toLocaleString()}</div>
            <div className="text-xs font-medium mt-1 text-white/50">{s.label}</div>
          </div>
        ))}
        <div className="rounded-3xl glass gilt-border p-5">
          <div className="text-xl font-semibold text-gilt-300">{toVerify}</div>
          <div className="text-xs font-medium mt-1 text-white/50">Screenshots to Verify</div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass gilt-border text-white/40">No registrations for this trip yet</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="rounded-3xl glass gilt-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{b.name}</span>
                    <span className="text-xs font-mono text-white/40">{b.bookingRef}</span>
                    {b.isWalkIn && <span className="text-xs bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full">Walk-in</span>}
                  </div>
                  <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-xs text-gilt-300 mt-0.5"><Phone size={11} />{b.phone}</a>
                  <div className="text-xs text-white/40 mt-1">{b.passengers?.length || b.numPersons} passenger(s)</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/50">Total <span className="font-semibold text-white">₹{(b.totalAmount || 0).toLocaleString()}</span></div>
                  <div className="text-sm text-white/50">Paid <span className="font-semibold text-emerald-300">₹{(b.amountPaid || 0).toLocaleString()}</span></div>
                  <div className="mt-1"><PaymentStatusBadge status={b.paymentStatus} /></div>
                </div>
              </div>

              {b.paymentRef && <div className="text-xs text-white/50 mt-2">Ref: <span className="font-mono">{b.paymentRef}</span></div>}
              {b.paymentNote && <div className="text-xs text-white/50 italic mt-1">{b.paymentNote}</div>}

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {b.paymentScreenshot ? (
                  <button onClick={() => setViewShot(b.paymentScreenshot!)} className="text-xs flex items-center gap-1 text-gilt-300 hover:underline"><ImageIcon size={13} /> View Screenshot</button>
                ) : (
                  <span className="text-xs text-white/40 flex items-center gap-1"><ImageIcon size={13} /> No screenshot</span>
                )}
                <div className="flex-1" />
                {b.paymentStatus !== 'confirmed' && (
                  <button className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" disabled={busy === b._id} onClick={() => updatePayment(b._id, { paymentStatus: 'confirmed', amountPaid: b.amountPaid || b.totalAmount || 0, status: 'confirmed' })}>
                    <CheckCircle2 size={14} /> Confirm
                  </button>
                )}
                {b.paymentStatus !== 'rejected' && (
                  <button className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/25 disabled:opacity-60" disabled={busy === b._id} onClick={() => updatePayment(b._id, { paymentStatus: 'rejected' })}>
                    <XCircle size={14} /> Reject
                  </button>
                )}
                <button className={ghostBtn} onClick={() => startEdit(b)}>Edit</button>
              </div>

              {editId === b._id && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/[0.03] rounded-2xl p-3">
                  <input className={adminControl} type="number" placeholder="Amount paid" value={edit.amountPaid} onChange={(e) => setEdit({ ...edit, amountPaid: e.target.value })} />
                  <input className={adminControl} placeholder="Payment ref / UTR" value={edit.paymentRef} onChange={(e) => setEdit({ ...edit, paymentRef: e.target.value })} />
                  <input className={adminControl} placeholder="Note" value={edit.paymentNote} onChange={(e) => setEdit({ ...edit, paymentNote: e.target.value })} />
                  <div className="sm:col-span-3 flex gap-2">
                    <button className="inline-flex items-center rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-5 py-2 text-sm font-semibold text-ink-900" onClick={() => saveEdit(b._id)}>Save</button>
                    <button className={ghostBtn} onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewShot && (
        <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewShot(null)}>
          <div className="glass-strong gilt-border rounded-3xl p-3 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-sm font-medium text-white/80">Payment Screenshot</span>
              <button onClick={() => setViewShot(null)} className="text-white/50 hover:text-white"><XCircle size={18} /></button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded payment screenshot (data URL), not an optimizable remote image */}
            <img src={viewShot} alt="Payment screenshot" className="w-full rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  )
}
