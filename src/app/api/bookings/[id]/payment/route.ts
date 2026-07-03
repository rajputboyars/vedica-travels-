import { NextRequest, NextResponse } from 'next/server'
import { isDBConfigured, getBooking, updateBooking } from '@/lib/demo-store'

// Updates payment fields on a booking. Used by the public screenshot upload
// and by the admin payment-management section.
const allowed = ['paymentStatus', 'amountPaid', 'paymentMethod', 'paymentRef', 'paymentScreenshot', 'paymentNote', 'status']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (!isDBConfigured) {
    const booking = updateBooking(id, update)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const booking = await Booking.findByIdAndUpdate(id, update, { new: true })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
