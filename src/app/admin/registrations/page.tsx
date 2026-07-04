'use client'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, CheckCircle2, XCircle, RotateCcw, Phone, X, BellRing, Ban } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import type { Registration, RegistrationPaymentStatus } from '@/types'
import { idTypeLabels } from '@/types'

type PaymentFilter = 'all' | RegistrationPaymentStatus

const paymentStatusMeta: Record<RegistrationPaymentStatus, { label: string; badgeClass: string }> = {
  not_submitted: { label: 'Not Submitted', badgeClass: 'bg-gray-100 text-gray-600' },
  waiting_verification: { label: 'Waiting for Verification', badgeClass: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Verified', badgeClass: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', badgeClass: 'bg-red-100 text-red-700' },
  resubmission_requested: { label: 'Resubmission Requested', badgeClass: 'bg-blue-100 text-blue-700' },
}

const bookingStatusMeta: Record<Registration['status'], { label: string; badgeClass: string }> = {
  pending_payment: { label: 'Pending Payment', badgeClass: 'bg-gray-100 text-gray-600' },
  confirmed: { label: 'Confirmed', badgeClass: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-700' },
}

// Phase 7 — seat status badge, shown alongside booking/payment status so
// a waiting-list registration is visually obvious in the list.
const seatStatusMeta: Record<Registration['seatStatus'], { label: string; badgeClass: string }> = {
  reserved: { label: 'Reserved (Temporary)', badgeClass: 'bg-sky-100 text-sky-700' },
  confirmed: { label: 'Seat Confirmed', badgeClass: 'bg-green-100 text-green-700' },
  released: { label: 'Seat Released', badgeClass: 'bg-gray-100 text-gray-500' },
  waiting_list: { label: 'Waiting List', badgeClass: 'bg-purple-100 text-purple-700' },
}

type ReasonMode = 'reject' | 'resubmit' | 'cancel'

// Phase 5/7 admin dashboard: view screenshots/booking details, and
// Approve/Reject/Request New Screenshot on submitted payments, plus
// Cancel (Phase 7) which releases the seat and auto-promotes the oldest
// waiting-list registration for the same package, if any (see
// cancelRegistration() in registration.service.ts).
export default function AdminRegistrationsPage() {
  const { data: registrations, loading, refetch } = useFetch<Registration[]>('/api/registrations', [])
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [viewShot, setViewShot] = useState<string | null>(null)
  const [reasonModal, setReasonModal] = useState<{ mode: ReasonMode; registration: Registration } | null>(null)
  const [reason, setReason] = useState('')
  const [remindersBusy, setRemindersBusy] = useState(false)
  const [remindersResult, setRemindersResult] = useState('')

  const filtered = useMemo(() => {
    if (paymentFilter === 'all') return registrations
    return registrations.filter((r) => r.paymentStatus === paymentFilter)
  }, [registrations, paymentFilter])

  async function approve(r: Registration) {
    setBusyId(r._id)
    await fetch(`/api/registrations/${r._id}/approve`, { method: 'PATCH' })
    await refetch()
    setBusyId(null)
  }

  const reasonEndpoint: Record<ReasonMode, string> = {
    reject: 'reject',
    resubmit: 'request-resubmission',
    cancel: 'cancel',
  }

  async function submitReason() {
    if (!reasonModal || !reason.trim()) return
    const { mode, registration } = reasonModal
    setBusyId(registration._id)
    await fetch(`/api/registrations/${registration._id}/${reasonEndpoint[mode]}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    await refetch()
    setBusyId(null)
    setReasonModal(null)
    setReason('')
  }

  // Phase 6 — manual trigger for the same job an external cron should
  // call daily in production (see /api/registrations/send-reminders).
  // Handy for testing without configuring CRON_SECRET first.
  async function sendReminders() {
    setRemindersBusy(true)
    setRemindersResult('')
    try {
      const res = await fetch('/api/registrations/send-reminders', { method: 'POST' })
      const data = await res.json()
      setRemindersResult(res.ok ? `Sent ${data.sent} reminder(s).` : data.error || 'Failed to send reminders')
    } catch {
      setRemindersResult('Failed to send reminders')
    } finally {
      setRemindersBusy(false)
    }
  }

  const reasonModalTitle: Record<ReasonMode, string> = {
    reject: 'Reject Payment',
    resubmit: 'Request New Screenshot',
    cancel: 'Cancel Booking',
  }
  const reasonModalPlaceholder: Record<ReasonMode, string> = {
    reject: 'e.g. Amount does not match package price',
    resubmit: 'e.g. Screenshot is blurry, please resend',
    cancel: 'e.g. Customer requested cancellation',
  }
  const reasonModalConfirmLabel: Record<ReasonMode, string> = {
    reject: 'Reject & Notify',
    resubmit: 'Request & Notify',
    cancel: 'Cancel & Notify',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registrations</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {registrations.length} registrations</p>
        </div>
        <div className="text-right">
          <Button size="sm" variant="outline" disabled={remindersBusy} onClick={sendReminders}>
            <BellRing size={14} className="mr-1" /> {remindersBusy ? 'Sending...' : 'Send Trip Reminders Now'}
          </Button>
          {remindersResult && <p className="text-xs text-gray-500 mt-1">{remindersResult}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}>
          <option value="all">All Payment Statuses</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="waiting_verification">Waiting for Verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="resubmission_requested">Resubmission Requested</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No registrations match these filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{r.name}</span>
                    <span className="text-xs font-mono text-gray-400">{r.bookingId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bookingStatusMeta[r.status].badgeClass}`}>{bookingStatusMeta[r.status].label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusMeta[r.paymentStatus].badgeClass}`}>{paymentStatusMeta[r.paymentStatus].label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seatStatusMeta[r.seatStatus].badgeClass}`}>{seatStatusMeta[r.seatStatus].label}</span>
                  </div>
                  <div className="text-xs text-orange-600 mt-0.5">{r.packageTitle}</div>
                  <a href={`tel:${r.mobile}`} className="flex items-center gap-1 text-xs text-gray-500 mt-1"><Phone size={11} />{r.mobile}</a>
                  <div className="text-xs text-gray-400 mt-1">
                    {r.numPersons} person(s) · Travel {new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.city}, {r.state}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{idTypeLabels[r.idType]}: {r.idNumber}</div>
                  {r.specialRequests && <div className="text-xs text-gray-500 italic mt-1">&quot;{r.specialRequests}&quot;</div>}
                </div>
                <div className="text-right shrink-0">
                  {r.paymentAmount != null && (
                    <div className="text-sm text-gray-500">Submitted <span className="font-semibold text-gray-800">₹{r.paymentAmount.toLocaleString()}</span></div>
                  )}
                  {r.transactionId && <div className="text-xs text-gray-400 font-mono mt-0.5">{r.transactionId}</div>}
                  {r.upiId && <div className="text-xs text-gray-400">{r.upiId}</div>}
                </div>
              </div>

              {r.paymentReviewNote && (
                <div className="text-xs text-gray-500 italic mt-2 bg-gray-50 rounded-lg px-3 py-2">Note sent to customer: &quot;{r.paymentReviewNote}&quot;</div>
              )}
              {r.cancellationReason && (
                <div className="text-xs text-red-500 italic mt-2 bg-red-50 rounded-lg px-3 py-2">Cancelled: &quot;{r.cancellationReason}&quot;</div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {r.paymentScreenshot ? (
                  <button onClick={() => setViewShot(r.paymentScreenshot!)} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <ImageIcon size={13} /> View Screenshot
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><ImageIcon size={13} /> No screenshot yet</span>
                )}
                <div className="flex-1" />
                {r.paymentStatus === 'waiting_verification' && (
                  <>
                    <Button size="sm" disabled={busyId === r._id} onClick={() => approve(r)} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 size={14} className="mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'resubmit', registration: r }); setReason('') }}>
                      <RotateCcw size={14} className="mr-1" /> Request New Screenshot
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'reject', registration: r }); setReason('') }}>
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                  </>
                )}
                {r.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'cancel', registration: r }); setReason('') }}>
                    <Ban size={14} className="mr-1" /> Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewShot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setViewShot(null)}>
          <div className="absolute inset-0 bg-black/60" />
          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded payment screenshot (data URL), not an optimizable remote image */}
          <img src={viewShot} alt="Payment screenshot" className="relative max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}

      {reasonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReasonModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">{reasonModalTitle[reasonModal.mode]}</h3>
              <button onClick={() => setReasonModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">This message is emailed directly to {reasonModal.registration.name}.</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonModalPlaceholder[reasonModal.mode]}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setReasonModal(null)}>Cancel</Button>
              <Button variant={reasonModal.mode === 'resubmit' ? 'default' : 'destructive'} disabled={!reason.trim() || busyId === reasonModal.registration._id} onClick={submitReason}>
                {busyId === reasonModal.registration._id ? 'Sending...' : reasonModalConfirmLabel[reasonModal.mode]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
