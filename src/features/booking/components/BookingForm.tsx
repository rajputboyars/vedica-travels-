'use client'
import { useState } from 'react'
import { defaultContact, defaultPassenger, type ContactFormValue, type PassengerFormValue } from '../types'
import ContactStep from './ContactStep'
import PassengersStep from './PassengersStep'
import PaymentStep from './PaymentStep'
import SuccessStep from './SuccessStep'

interface Props {
  tourId: string
  tourTitle: string
  price?: number
  qrImage?: string
  paymentNote?: string
}

// Orchestrates the 3-step registration flow (contact -> passengers ->
// payment) and owns the network calls; each step is a dumb, focused
// component so the multi-step state machine doesn't turn into one
// 300-line file mixing form fields, validation, and fetch calls.
export default function BookingForm({ tourId, tourTitle, price, qrImage, paymentNote }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [contact, setContact] = useState<ContactFormValue>(defaultContact())
  const [passengers, setPassengers] = useState<PassengerFormValue[]>([defaultPassenger()])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [booking, setBooking] = useState<{ _id: string; bookingRef: string } | null>(null)

  const totalAmount = price ? price * passengers.length : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setHasError(false)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          tourTitle,
          ...contact,
          passengers: passengers.map((p) => ({ ...p, age: Number(p.age), attendance: 'not_marked' })),
          numPersons: passengers.length,
          totalAmount: totalAmount || undefined,
          message,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBooking({ _id: data._id, bookingRef: data.bookingRef })
        setStep(3)
      } else {
        setHasError(true)
      }
    } catch {
      setHasError(true)
    } finally {
      setSubmitting(false)
    }
  }

  async function submitPayment({ screenshot, payRef }: { screenshot: string; payRef: string }) {
    if (!booking) return
    try {
      await fetch(`/api/bookings/${booking._id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'screenshot_received',
          amountPaid: totalAmount || undefined,
          paymentMethod: 'UPI',
          paymentRef: payRef,
          paymentScreenshot: screenshot,
        }),
      })
    } finally {
      // Booking is already saved regardless of whether this call succeeds —
      // payment details can be corrected later by an admin, so we don't
      // block the success state on it.
      setSucceeded(true)
    }
  }

  function resetAll() {
    setSucceeded(false)
    setStep(1)
    setBooking(null)
    setPassengers([defaultPassenger()])
    setMessage('')
    setContact(defaultContact())
  }

  if (succeeded) {
    return <SuccessStep bookingRef={booking?.bookingRef} onReset={resetAll} />
  }

  if (step === 3 && booking) {
    return (
      <PaymentStep
        bookingRef={booking.bookingRef}
        totalAmount={totalAmount}
        qrImage={qrImage}
        paymentNote={paymentNote}
        onSubmitPayment={submitPayment}
        onSkip={() => setSucceeded(true)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 mb-5">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 1 ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'}`}>1</div>
        <div className="text-xs text-gray-500">Contact</div>
        <div className="flex-1 h-px bg-gray-200 mx-1"></div>
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        <div className="text-xs text-gray-500">Passengers</div>
        <div className="flex-1 h-px bg-gray-200 mx-1"></div>
        <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-gray-200 text-gray-400">3</div>
        <div className="text-xs text-gray-500">Payment</div>
      </div>

      {step === 1 && <ContactStep contact={contact} onChange={setContact} onNext={() => setStep(2)} />}

      {step === 2 && (
        <PassengersStep
          passengers={passengers}
          onChange={setPassengers}
          message={message}
          onMessageChange={setMessage}
          price={price}
          submitting={submitting}
          hasError={hasError}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
    </form>
  )
}
