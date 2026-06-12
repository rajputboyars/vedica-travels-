import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await connectDB()
    const booking = await Booking.findById(id)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await connectDB()
    const body = await req.json()
    const booking = await Booking.findByIdAndUpdate(id, body, { new: true })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await connectDB()
    await Booking.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
