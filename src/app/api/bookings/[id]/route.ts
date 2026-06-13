import { NextRequest, NextResponse } from 'next/server'
import { isDBConfigured, getBooking, updateBooking, deleteBooking } from '@/lib/demo-store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    const booking = getBooking(id)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(booking)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
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
  const body = await req.json()
  if (!isDBConfigured) {
    const booking = updateBooking(id, body)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const booking = await Booking.findByIdAndUpdate(id, body, { new: true })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    deleteBooking(id)
    return NextResponse.json({ success: true })
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    await Booking.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
