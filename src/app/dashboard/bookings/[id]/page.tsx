'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Ban, Receipt, ImageIcon } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { bookingStatusMeta, paymentStatusMeta, seatStatusMeta, statusBadge } from '@/config/registration-status'
import { idTypeLabels } from '@/types'
import type { Package, Registration } from '@/types'

interface PageProps { params: Promise<{ id: string }> }

// Light-surface form inputs (payment upload lives inside a white island card).
const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

// Phase 9 -- booking detail: status/payment/seat status, upload payment
// screenshot, cancel booking, and a link to a printable receipt.
export default function BookingDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: registration, loading, refetch } = useFetch<Registration | null>(`/api/registrations/${id}`, null)
  const { data: pkg } = useFetch<Package | null>(registration ? `/api/packages/${registration.packageId}` : '', null)

  const [payment, setPayment] = useState({ transactionId: '', upiId: '', paymentAmount: '', screenshot: '' })
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  function handleScreenshotFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPayment((p) => ({ ...p, screenshot: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!registration) return
    setPaymentSubmitting(true)
    setPaymentError('')
    try {
      const res = await fetch(`/api/registrations/${registration._id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: payment.transactionId,
          upiId: payment.upiId || undefined,
          paymentAmount: Number(payment.paymentAmount) || 0,
          paymentScreenshot: payment.screenshot,
        }),
      })
      if (res.ok) {
        setPayment({ transactionId: '', upiId: '', paymentAmount: '', screenshot: '' })
        await refetch()
      } else {
        const data = await res.json().catch(() => ({}))
        setPaymentError(data.error || 'Failed to submit payment details')
      }
    } catch {
      setPaymentError('Failed to submit payment details')
    } finally {
      setPaymentSubmitting(false)
    }
  }

  async function cancelBooking() {
    setCancelling(true)
    await fetch(`/api/registrations/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Cancelled by customer' }),
    })
    await refetch()
    setCancelling(false)
    setShowCancelConfirm(false)
  }

  if (loading) return <div className="text-center py-16 text-white/40">Loading…</div>
  if (!registration) {
    return (
      <div className="text-center py-16 rounded-3xl glass gilt-border text-white/50">
        Booking not found.{' '}
        <Link href="/dashboard/bookings" className="text-gilt-300 hover:underline">Back to My Bookings</Link>
      </div>
    )
  }

  const canUploadPayment = registration.status !== 'cancelled' && (registration.paymentStatus === 'not_submitted' || registration.paymentStatus === 'resubmission_requested')
  const canCancel = registration.status !== 'cancelled'

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/bookings" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit">
        <ArrowLeft size={15} /> Back to My Bookings
      </Link>

      <div>
        <h1 className="font-display text-3xl font-semibold text-white">{registration.packageTitle}</h1>
        <p className="mt-1 text-white/45 text-sm font-mono">{registration.bookingId}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={statusBadge(bookingStatusMeta[registration.status]).className}>{bookingStatusMeta[registration.status].label}</span>
        <span className={statusBadge(paymentStatusMeta[registration.paymentStatus]).className}>{paymentStatusMeta[registration.paymentStatus].label}</span>
        <span className={statusBadge(seatStatusMeta[registration.seatStatus]).className}>{seatStatusMeta[registration.seatStatus].label}</span>
      </div>

      {registration.paymentReviewNote && (registration.paymentStatus === 'rejected' || registration.paymentStatus === 'resubmission_requested') && (
        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm rounded-xl px-4 py-3">
          Note from our team: &quot;{registration.paymentReviewNote}&quot;
        </div>
      )}
      {registration.cancellationReason && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm rounded-xl px-4 py-3">
          Cancelled: &quot;{registration.cancellationReason}&quot;
        </div>
      )}

      <div className="rounded-3xl glass gilt-border p-7">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Trip Details</h2>
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div><div className="text-white/40 text-xs">Travel Date</div><div className="font-medium text-white">{new Date(registration.travelDate).toLocaleDateString('en-IN')}</div></div>
          <div><div className="text-white/40 text-xs">Persons</div><div className="font-medium text-white">{registration.numPersons}</div></div>
          <div><div className="text-white/40 text-xs">Traveller</div><div className="font-medium text-white">{registration.name}</div></div>
          <div><div className="text-white/40 text-xs">Mobile</div><a href={`tel:${registration.mobile}`} className="font-medium text-gilt-300 flex items-center gap-1"><Phone size={12} />{registration.mobile}</a></div>
          <div><div className="text-white/40 text-xs">ID</div><div className="font-medium text-white">{idTypeLabels[registration.idType]}: {registration.idNumber}</div></div>
          <div><div className="text-white/40 text-xs">City/State</div><div className="font-medium text-white">{registration.city}, {registration.state}</div></div>
          {registration.specialRequests && (
            <div className="col-span-2"><div className="text-white/40 text-xs">Special Requests</div><div className="text-white/70 italic">&quot;{registration.specialRequests}&quot;</div></div>
          )}
        </div>
      </div>

      {registration.paymentAmount != null && (
        <div className="rounded-3xl glass gilt-border p-7">
          <h2 className="font-display text-lg font-semibold text-white mb-3">Payment</h2>
          <div className="text-sm space-y-1.5 text-white/70">
            <div>Amount: <span className="font-semibold text-white">₹{registration.paymentAmount.toLocaleString()}</span></div>
            {registration.transactionId && <div>Transaction ID: <span className="font-mono text-white/60">{registration.transactionId}</span></div>}
            {registration.upiId && <div>UPI ID: {registration.upiId}</div>}
            {registration.paymentScreenshot && (
              <a href={registration.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-gilt-300 text-xs flex items-center gap-1 hover:underline pt-1">
                <ImageIcon size={13} /> View submitted screenshot
              </a>
            )}
          </div>
        </div>
      )}

      {canUploadPayment && (
        <div className="rounded-3xl bg-white text-gray-900 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-gilt-500/20">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {registration.paymentStatus === 'resubmission_requested' ? 'Resubmit Payment Details' : 'Upload Payment Screenshot'}
          </h2>
          {pkg?.paymentNote && <p className="text-sm text-gray-600 mb-3">{pkg.paymentNote}</p>}
          {pkg?.qrImages && pkg.qrImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {pkg.qrImages.map((qr, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- admin-supplied QR image, same pattern as RegistrationForm.tsx
                <img key={i} src={qr} alt={`Payment QR ${i + 1}`} className="w-28 h-28 object-contain border border-orange-200 rounded-lg bg-white" />
              ))}
            </div>
          )}
          <form onSubmit={submitPayment} className="space-y-3">
            {paymentError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{paymentError}</div>}
            <div>
              <label className={labelClass}>Transaction ID *</label>
              <input className={inputClass} value={payment.transactionId} onChange={(e) => setPayment({ ...payment, transactionId: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>UPI ID (optional)</label>
              <input className={inputClass} value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Payment Amount (₹) *</label>
              <input className={inputClass} type="number" value={payment.paymentAmount} onChange={(e) => setPayment({ ...payment, paymentAmount: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Payment Screenshot *</label>
              <input type="file" accept="image/*" onChange={handleScreenshotFile} required className="block w-full text-sm text-gray-600" />
              {payment.screenshot && (
                // eslint-disable-next-line @next/next/no-img-element -- local file preview via FileReader
                <img src={payment.screenshot} alt="Screenshot preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
            <button type="submit" disabled={paymentSubmitting || !payment.screenshot} className="w-full inline-flex items-center justify-center rounded-lg bg-orange-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-orange-700 disabled:opacity-60">
              {paymentSubmitting ? 'Submitting…' : 'Submit Payment Details'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/bookings/${id}/receipt`} className="inline-flex items-center gap-2 rounded-full glass gilt-border px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">
          <Receipt size={15} className="text-gilt-300" /> Download Receipt
        </Link>
        {canCancel && (
          <button onClick={() => setShowCancelConfirm(true)} className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 px-6 py-3 text-sm font-medium hover:bg-rose-500/25 transition-colors">
            <Ban size={15} /> Cancel Booking
          </button>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative glass-strong gilt-border rounded-3xl w-full max-w-sm p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-2">Cancel this booking?</h3>
            <p className="text-sm text-white/55 mb-5">This releases your seat hold. If you&apos;ve already paid, contact us for a refund.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCancelConfirm(false)} className="rounded-full glass gilt-border px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5">Keep Booking</button>
              <button disabled={cancelling} onClick={cancelBooking} className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60">{cancelling ? 'Cancelling…' : 'Yes, Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
