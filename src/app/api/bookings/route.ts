import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET() {
  try {
    await connectDB()
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).populate('tourId', 'title')
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const booking = await Booking.create(body)
    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
