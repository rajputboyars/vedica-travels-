import { NextRequest, NextResponse } from 'next/server'
import { isDBConfigured, getBooking } from '@/lib/demo-store'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { passengerIndex, attendance } = await req.json()
  if (!isDBConfigured) {
    const booking = getBooking(id)
    if (!booking || !booking.passengers[passengerIndex]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    booking.passengers[passengerIndex].attendance = attendance
    return NextResponse.json(booking)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const booking = await Booking.findById(id)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    booking.passengers[passengerIndex].attendance = attendance
    booking.markModified('passengers')
    await booking.save()
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}
