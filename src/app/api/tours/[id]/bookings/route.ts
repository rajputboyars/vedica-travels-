import { NextRequest, NextResponse } from 'next/server'
import { isDBConfigured, getBookingsByTour } from '@/lib/demo-store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    return NextResponse.json(getBookingsByTour(id))
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const bookings = await Booking.find({ tourId: id }).sort({ createdAt: -1 })
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
