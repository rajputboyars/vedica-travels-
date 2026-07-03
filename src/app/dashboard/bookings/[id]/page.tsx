'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Ban, Receipt, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFetch } from '@/hooks/use-fetch'
import { bookingStatusMeta, paymentStatusMeta, seatStatusMeta, statusBadge } from '@/config/registration-status'
import { idTypeLabels } from '@/types'
import type { Package, Registration } from '@/types'

interface PageProps { params: Promise<{ id: string }> }

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

// Phase 9 -- booking detail: status/payment/seat status, upload payment
// screenshot (reusing PUT /api/registrations/[id]/payment -- already
// public, see that route's doc comment), cancel booking (Phase 7's
// cancelRegistration, now also owner-callable -- see the cancel route's
// Phase 9 comment), and a link to a printable receipt.
//
// The upload-payment form here mirrors the inline one in
// RegistrationForm.tsx (same FileReader-to-base64 pattern) rather than
// importing a shared component -- RegistrationForm's version is coupled to
// its own stage state machine, and duplicating this one small form was
// lower-risk than refactoring an already-working file. A shared
// PaymentSubmissionForm component is a reasonable follow-up if a third
// consumer shows up.
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

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>
  if (!registration) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">
        Booking not found.{' '}
        <Link href="/dashboard/bookings" className="text-orange-600 hover:underline">Back to My Bookings</Link>
      </div>
    )
  }

  const canUploadPayment = registration.status !== 'cancelled' && (registration.paymentStatus === 'not_submitted' || registration.paymentStatus === 'resubmission_requested')
  const canCancel = registration.status !== 'cancelled'

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/bookings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to My Bookings
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">{registration.packageTitle}</h1>
        <p className="text-gray-500 text-sm font-mono">{registration.bookingId}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={statusBadge(bookingStatusMeta[registration.status]).className}>{bookingStatusMeta[registration.status].label}</span>
        <span className={statusBadge(paymentStatusMeta[registration.paymentStatus]).className}>{paymentStatusMeta[registration.paymentStatus].label}</span>
        <span className={statusBadge(seatStatusMeta[registration.seatStatus]).className}>{seatStatusMeta[registration.seatStatus].label}</span>
      </div>

      {registration.paymentReviewNote && (registration.paymentStatus === 'rejected' || registration.paymentStatus === 'resubmission_requested') && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          Note from our team: &quot;{registration.paymentReviewNote}&quot;
        </div>
      )}
      {registration.cancellationReason && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          Cancelled: &quot;{registration.cancellationReason}&quot;
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Trip Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-gray-400 text-xs">Travel Date</div><div className="font-medium text-gray-800">{new Date(registration.travelDate).toLocaleDateString('en-IN')}</div></div>
          <div><div className="text-gray-400 text-xs">Persons</div><div className="font-medium text-gray-800">{registration.numPersons}</div></div>
          <div><div className="text-gray-400 text-xs">Traveller</div><div className="font-medium text-gray-800">{registration.name}</div></div>
          <div><div className="text-gray-400 text-xs">Mobile</div><a href={`tel:${registration.mobile}`} className="font-medium text-orange-600 flex items-center gap-1"><Phone size={12} />{registration.mobile}</a></div>
          <div><div className="text-gray-400 text-xs">ID</div><div className="font-medium text-gray-800">{idTypeLabels[registration.idType]}: {registration.idNumber}</div></div>
          <div><div className="text-gray-400 text-xs">City/State</div><div className="font-medium text-gray-800">{registration.city}, {registration.state}</div></div>
          {registration.specialRequests && (
            <div className="col-span-2"><div className="text-gray-400 text-xs">Special Requests</div><div className="text-gray-700 italic">&quot;{registration.specialRequests}&quot;</div></div>
          )}
        </CardContent>
      </Card>

      {registration.paymentAmount != null && (
        <Card>
          <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Amount: <span className="font-semibold text-gray-800">₹{registration.paymentAmount.toLocaleString()}</span></div>
            {registration.transactionId && <div className="text-gray-500">Transaction ID: <span className="font-mono">{registration.transactionId}</span></div>}
            {registration.upiId && <div className="text-gray-500">UPI ID: {registration.upiId}</div>}
            {registration.paymentScreenshot && (
              <a href={registration.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center gap-1 hover:underline pt-1">
                <ImageIcon size={13} /> View submitted screenshot
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {canUploadPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {registration.paymentStatus === 'resubmission_requested' ? 'Resubmit Payment Details' : 'Upload Payment Screenshot'}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <Button type="submit" disabled={paymentSubmitting || !payment.screenshot} className="w-full">
                {paymentSubmitting ? 'Submitting…' : 'Submit Payment Details'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/bookings/${id}/receipt`}>
          <Button variant="outline"><Receipt size={15} className="mr-1" /> Download Receipt</Button>
        </Link>
        {canCancel && (
          <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
            <Ban size={15} className="mr-1" /> Cancel Booking
          </Button>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Cancel this booking?</h3>
            <p className="text-sm text-gray-500 mb-4">This releases your seat hold. If you&apos;ve already paid, contact us for a refund.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Keep Booking</Button>
              <Button variant="destructive" disabled={cancelling} onClick={cancelBooking}>{cancelling ? 'Cancelling…' : 'Yes, Cancel'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
