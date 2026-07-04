import { NextRequest, NextResponse } from 'next/server'
import { listBookings, createBooking } from '@/services/booking.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listBookings())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const booking = await createBooking(body)
    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
