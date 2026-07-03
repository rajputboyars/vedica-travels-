import { NextRequest, NextResponse } from 'next/server'
import { updatePayment } from '@/services/booking.service'

// Updates payment fields on a booking. Used by the public screenshot upload
// step and by the admin payment-management section. Field allowlisting
// lives in the service so both callers get the same protection.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const booking = await updatePayment(id, body)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
