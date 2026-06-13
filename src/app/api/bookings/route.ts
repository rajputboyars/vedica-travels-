import { NextRequest, NextResponse } from 'next/server'
import { isDBConfigured, getBookings, addBooking, genBookingRef } from '@/lib/demo-store'

export async function GET() {
  if (!isDBConfigured) {
    return NextResponse.json(getBookings())
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).populate('tourId', 'title')
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.bookingRef) body.bookingRef = genBookingRef()
  if (!isDBConfigured) {
    return NextResponse.json(addBooking(body), { status: 201 })
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const booking = await Booking.create(body)
    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
