import { NextRequest, NextResponse } from 'next/server'
import { updateAttendance } from '@/services/booking.service'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { passengerIndex, attendance } = await req.json()
    const booking = await updateAttendance(id, passengerIndex, attendance)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}
