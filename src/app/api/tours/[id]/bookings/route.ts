import { NextRequest, NextResponse } from 'next/server'
import { listBookingsByTour } from '@/services/booking.service'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(await listBookingsByTour(id))
}
