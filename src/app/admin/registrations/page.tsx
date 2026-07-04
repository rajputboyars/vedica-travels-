'use client'
import { useMemo, useState } from 'react'
import { Image as ImageIcon, CheckCircle2, XCircle, RotateCcw, Phone, X, BellRing, Ban } from 'lucide-react'
import { AdminHeader, adminControl, ghostBtn, primaryBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import type { Registration, RegistrationPaymentStatus } from '@/types'
import { idTypeLabels } from '@/types'

type PaymentFilter = 'all' | RegistrationPaymentStatus

const paymentStatusMeta: Record<RegistrationPaymentStatus, { label: string; badgeClass: string }> = {
  not_submitted: { label: 'Not Submitted', badgeClass: 'bg-white/10 text-white/60' },
  waiting_verification: { label: 'Waiting for Verification', badgeClass: 'bg-amber-500/15 text-amber-300' },
  verified: { label: 'Verified', badgeClass: 'bg-emerald-500/15 text-emerald-300' },
  rejected: { label: 'Rejected', badgeClass: 'bg-rose-500/15 text-rose-300' },
  resubmission_requested: { label: 'Resubmission Requested', badgeClass: 'bg-sky-500/15 text-sky-300' },
}

const bookingStatusMeta: Record<Registration['status'], { label: string; badgeClass: string }> = {
  pending_payment: { label: 'Pending Payment', badgeClass: 'bg-white/10 text-white/60' },
  confirmed: { label: 'Confirmed', badgeClass: 'bg-emerald-500/15 text-emerald-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-500/15 text-rose-300' },
}

const seatStatusMeta: Record<Registration['seatStatus'], { label: string; badgeClass: string }> = {
  reserved: { label: 'Reserved (Temporary)', badgeClass: 'bg-sky-500/15 text-sky-300' },
  confirmed: { label: 'Seat Confirmed', badgeClass: 'bg-emerald-500/15 text-emerald-300' },
  released: { label: 'Seat Released', badgeClass: 'bg-white/10 text-white/50' },
  waiting_list: { label: 'Waiting List', badgeClass: 'bg-violet-500/15 text-violet-300' },
}

type ReasonMode = 'reject' | 'resubmit' | 'cancel'

// Phase 5/7 admin dashboard: view screenshots/booking details, and
// Approve/Reject/Request New Screenshot on submitted payments, plus Cancel.
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

  const reasonEndpoint: Record<ReasonMode, string> = { reject: 'reject', resubmit: 'request-resubmission', cancel: 'cancel' }

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

  const reasonModalTitle: Record<ReasonMode, string> = { reject: 'Reject Payment', resubmit: 'Request New Screenshot', cancel: 'Cancel Booking' }
  const reasonModalPlaceholder: Record<ReasonMode, string> = {
    reject: 'e.g. Amount does not match package price',
    resubmit: 'e.g. Screenshot is blurry, please resend',
    cancel: 'e.g. Customer requested cancellation',
  }
  const reasonModalConfirmLabel: Record<ReasonMode, string> = { reject: 'Reject & Notify', resubmit: 'Request & Notify', cancel: 'Cancel & Notify' }

  return (
    <div className="space-y-6">
      <AdminHeader title="Registrations" description={`${filtered.length} of ${registrations.length} registrations`}>
        <div className="text-right">
          <button className={ghostBtn} disabled={remindersBusy} onClick={sendReminders}>
            <BellRing size={14} /> {remindersBusy ? 'Sending…' : 'Send Trip Reminders Now'}
          </button>
          {remindersResult && <p className="text-xs text-white/50 mt-1">{remindersResult}</p>}
        </div>
      </AdminHeader>

      <div className="flex flex-wrap gap-3">
        <select className={adminControl} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}>
          <option value="all">All Payment Statuses</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="waiting_verification">Waiting for Verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="resubmission_requested">Resubmission Requested</option>
        </select>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass gilt-border text-white/40">No registrations match these filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="rounded-3xl glass gilt-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-xs font-mono text-white/40">{r.bookingId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bookingStatusMeta[r.status].badgeClass}`}>{bookingStatusMeta[r.status].label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusMeta[r.paymentStatus].badgeClass}`}>{paymentStatusMeta[r.paymentStatus].label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seatStatusMeta[r.seatStatus].badgeClass}`}>{seatStatusMeta[r.seatStatus].label}</span>
                  </div>
                  <div className="text-xs text-gilt-300 mt-1">{r.packageTitle}</div>
                  <a href={`tel:${r.mobile}`} className="flex items-center gap-1 text-xs text-white/50 mt-1 hover:text-gilt-300"><Phone size={11} />{r.mobile}</a>
                  <div className="text-xs text-white/40 mt-1">{r.numPersons} person(s) · Travel {new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.city}, {r.state}</div>
                  <div className="text-xs text-white/40 mt-1">{idTypeLabels[r.idType]}: {r.idNumber}</div>
                  {r.specialRequests && <div className="text-xs text-white/50 italic mt-1">&quot;{r.specialRequests}&quot;</div>}
                </div>
                <div className="text-right shrink-0">
                  {r.paymentAmount != null && <div className="text-sm text-white/50">Submitted <span className="font-semibold text-white">₹{r.paymentAmount.toLocaleString()}</span></div>}
                  {r.transactionId && <div className="text-xs text-white/40 font-mono mt-0.5">{r.transactionId}</div>}
                  {r.upiId && <div className="text-xs text-white/40">{r.upiId}</div>}
                </div>
              </div>

              {r.paymentReviewNote && <div className="text-xs text-white/50 italic mt-2 bg-white/[0.03] rounded-xl px-3 py-2">Note sent to customer: &quot;{r.paymentReviewNote}&quot;</div>}
              {r.cancellationReason && <div className="text-xs text-rose-300 italic mt-2 bg-rose-500/10 rounded-xl px-3 py-2">Cancelled: &quot;{r.cancellationReason}&quot;</div>}

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {r.paymentScreenshot ? (
                  <button onClick={() => setViewShot(r.paymentScreenshot!)} className="text-xs flex items-center gap-1 text-gilt-300 hover:underline"><ImageIcon size={13} /> View Screenshot</button>
                ) : (
                  <span className="text-xs text-white/40 flex items-center gap-1"><ImageIcon size={13} /> No screenshot yet</span>
                )}
                <div className="flex-1" />
                {r.paymentStatus === 'waiting_verification' && (
                  <>
                    <button className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" disabled={busyId === r._id} onClick={() => approve(r)}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className={ghostBtn} disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'resubmit', registration: r }); setReason('') }}>
                      <RotateCcw size={14} /> Request New Screenshot
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/25 disabled:opacity-60" disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'reject', registration: r }); setReason('') }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                {r.status !== 'cancelled' && (
                  <button className={ghostBtn} disabled={busyId === r._id} onClick={() => { setReasonModal({ mode: 'cancel', registration: r }); setReason('') }}>
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewShot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setViewShot(null)}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded payment screenshot (data URL), not an optimizable remote image */}
          <img src={viewShot} alt="Payment screenshot" className="relative max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}

      {reasonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setReasonModal(null)} />
          <div className="relative glass-strong gilt-border rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">{reasonModalTitle[reasonModal.mode]}</h3>
              <button onClick={() => setReasonModal(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-sm text-white/55 mb-3">This message is emailed directly to {reasonModal.registration.name}.</p>
            <textarea
              className={`${adminControl} w-full`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonModalPlaceholder[reasonModal.mode]}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-4">
              <button className={ghostBtn} onClick={() => setReasonModal(null)}>Cancel</button>
              <button
                className={reasonModal.mode === 'resubmit' ? primaryBtn : 'inline-flex items-center gap-1 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60'}
                disabled={!reason.trim() || busyId === reasonModal.registration._id}
                onClick={submitReason}
              >
                {busyId === reasonModal.registration._id ? 'Sending…' : reasonModalConfirmLabel[reasonModal.mode]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
