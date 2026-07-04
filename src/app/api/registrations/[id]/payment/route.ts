import { NextRequest, NextResponse } from 'next/server'
import { getRegistration, submitPayment } from '@/services/registration.service'
import { apiError } from '@/lib/api-error'

// Public — the customer submitting payment proof doesn't need an
// account; the registration's own bookingId is effectively their access
// token to this step (they only reach it right after registering, or via
// their booking-lookup page). Server sets paymentSubmittedAt itself —
// see the comment in registration.service.ts submitPayment().
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const existing = await getRegistration(id)
    if (!existing) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })

    const body = await req.json()
    const { paymentScreenshot, transactionId, upiId, paymentAmount } = body
    if (!paymentScreenshot || !transactionId || !paymentAmount) {
      return NextResponse.json({ error: 'paymentScreenshot, transactionId and paymentAmount are required' }, { status: 400 })
    }

    const registration = await submitPayment(id, { paymentScreenshot, transactionId, upiId, paymentAmount: Number(paymentAmount) })
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
