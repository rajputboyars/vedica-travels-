'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { idTypeLabels } from '@/types'
import type { IdType, Gender, Registration } from '@/types'

interface Props {
  packageId: string
  packageTitle: string
  price?: number
  paymentNote?: string
  qrImages?: string[]
}

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

interface FormState {
  name: string
  age: string
  gender: Gender
  mobile: string
  email: string
  address: string
  city: string
  state: string
  emergencyContactName: string
  emergencyContactPhone: string
  idType: IdType
  idNumber: string
  travelDate: string
  numPersons: number
  specialRequests: string
}

function emptyForm(): FormState {
  return {
    name: '', age: '', gender: 'male', mobile: '', email: '', address: '', city: '', state: '',
    emergencyContactName: '', emergencyContactPhone: '', idType: 'aadhar', idNumber: '',
    travelDate: '', numPersons: 1, specialRequests: '',
  }
}

// Single-step form — Phase 4 is intentionally simpler than the legacy
// Tour BookingForm's multi-step passengers flow: one primary registrant
// plus a headcount (numPersons), not a per-passenger array. This is the
// "first booking version"; a future phase can add per-passenger detail
// the same way BookingForm does, without changing this component's shape.
export default function RegistrationForm({ packageId, packageTitle, price, paymentNote, qrImages }: Props) {
  const [stage, setStage] = useState<'form' | 'registered' | 'submitted'>('form')
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState<Registration | null>(null)

  const [payment, setPayment] = useState({ transactionId: '', upiId: '', paymentAmount: price ? String(price * form.numPersons) : '', screenshot: '' })
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          ...form,
          age: Number(form.age),
          numPersons: Number(form.numPersons),
          specialRequests: form.specialRequests || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setRegistration(data)
        setPayment((p) => ({ ...p, paymentAmount: price ? String(price * Number(form.numPersons)) : p.paymentAmount }))
        setStage('registered')
      } else {
        setError(data.error || 'Failed to submit registration')
      }
    } catch {
      setError('Failed to submit registration')
    } finally {
      setSubmitting(false)
    }
  }

  function handleScreenshotFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPayment((p) => ({ ...p, screenshot: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
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
        setStage('submitted')
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

  if (stage === 'submitted' && registration) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">🙏</div>
        <p className="text-green-600 font-semibold text-lg">Payment Details Submitted!</p>
        <p className="text-xs text-gray-500 mt-1">Booking ID: <span className="font-mono font-semibold text-gray-700">{registration.bookingId}</span></p>
        <p className="text-sm text-gray-500 mt-2">Status: <span className="font-medium text-amber-600">Waiting for Verification</span></p>
        <p className="text-sm text-gray-500 mt-2">We&apos;ll verify your payment and confirm your seat shortly. Keep your booking ID handy to check status.</p>
      </div>
    )
  }

  // Phase 7 — the package was full at registration time: no payment step
  // yet, they'll be emailed (waitlistPromotedEmail) once a seat opens up.
  if (stage === 'registered' && registration && registration.seatStatus === 'waiting_list') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">⏳</div>
        <p className="text-purple-600 font-semibold text-lg">You&apos;re on the Waiting List</p>
        <p className="text-xs text-gray-500 mt-1">Booking ID: <span className="font-mono font-semibold text-gray-700">{registration.bookingId}</span></p>
        <p className="text-sm text-gray-500 mt-2">This package is currently full. No payment is needed right now — we&apos;ll email you the moment a seat opens up so you can complete payment.</p>
      </div>
    )
  }

  if (stage === 'registered' && registration) {
    return (
      <div className="space-y-5">
        <div className="text-center py-2">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-semibold">Registration Received!</p>
          <p className="text-xs text-gray-500 mt-1">Booking ID: <span className="font-mono font-semibold text-gray-700">{registration.bookingId}</span></p>
          <p className="text-sm text-gray-500 mt-1">Status: <span className="font-medium text-amber-600">Pending Payment</span> · Seat: Reserved (temporary)</p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Payment Instructions</h3>
          <p className="text-sm text-gray-600">{paymentNote || 'Please call us to complete your payment before the confirmation deadline.'}</p>
          {qrImages && qrImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {qrImages.map((qr, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- admin-supplied QR image, same pattern as TourForm's QR upload
                <img key={i} src={qr} alt={`Payment QR ${i + 1}`} className="w-32 h-32 object-contain border border-orange-200 rounded-lg bg-white" />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Submit Your Payment Details</h3>
          {paymentError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{paymentError}</div>}
          <div>
            <label className={labelClass}>Transaction ID *</label>
            <input className={inputClass} value={payment.transactionId} onChange={(e) => setPayment({ ...payment, transactionId: e.target.value })} required placeholder="e.g. TXN220011" />
          </div>
          <div>
            <label className={labelClass}>UPI ID (optional)</label>
            <input className={inputClass} value={payment.upiId} onChange={(e) => setPayment({ ...payment, upiId: e.target.value })} placeholder="e.g. name@okhdfc" />
          </div>
          <div>
            <label className={labelClass}>Payment Amount (₹) *</label>
            <input className={inputClass} type="number" value={payment.paymentAmount} onChange={(e) => setPayment({ ...payment, paymentAmount: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Payment Screenshot *</label>
            <input type="file" accept="image/*" onChange={handleScreenshotFile} required className="block w-full text-sm text-gray-600" />
            {payment.screenshot && (
              // eslint-disable-next-line @next/next/no-img-element -- local file preview via FileReader, not an optimizable remote image
              <img src={payment.screenshot} alt="Screenshot preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200" />
            )}
          </div>
          <Button type="submit" disabled={paymentSubmitting || !payment.screenshot} className="w-full">
            {paymentSubmitting ? 'Submitting...' : 'Submit Payment Details'}
          </Button>
          <p className="text-xs text-gray-400 text-center">No payment gateway — this just tells us to verify your manual payment.</p>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-gray-800">Register for {packageTitle}</h3>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Age *</label>
          <input className={inputClass} type="number" min={1} value={form.age} onChange={(e) => update('age', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value as Gender)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Mobile *</label>
          <input className={inputClass} type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address *</label>
          <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>State *</label>
          <input className={inputClass} value={form.state} onChange={(e) => update('state', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Emergency Contact Name *</label>
          <input className={inputClass} value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Emergency Contact Phone *</label>
          <input className={inputClass} type="tel" value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Government ID Type *</label>
          <select className={inputClass} value={form.idType} onChange={(e) => update('idType', e.target.value as IdType)}>
            {Object.entries(idTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Government ID Number *</label>
          <input className={inputClass} value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Travel Date *</label>
          <input className={inputClass} type="date" value={form.travelDate} onChange={(e) => update('travelDate', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Number of Persons *</label>
          <input className={inputClass} type="number" min={1} value={form.numPersons} onChange={(e) => update('numPersons', Number(e.target.value))} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Special Requests</label>
          <textarea className={inputClass} rows={2} value={form.specialRequests} onChange={(e) => update('specialRequests', e.target.value)} placeholder="Optional — dietary needs, seating preference, etc." />
        </div>
      </div>

      {price && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          Estimated total: <span className="font-semibold text-gray-800">₹{(price * form.numPersons).toLocaleString()}</span> ({form.numPersons} × ₹{price.toLocaleString()})
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Submitting...' : 'Submit Registration'}
      </Button>
      <p className="text-xs text-gray-400 text-center">No payment happens on this step — you&apos;ll see payment instructions after registering (unless the package is full, in which case you&apos;ll join the waiting list instead).</p>
    </form>
  )
}
