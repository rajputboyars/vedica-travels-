import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await connectDB()
    const { passengerIndex, attendance } = await req.json()
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
