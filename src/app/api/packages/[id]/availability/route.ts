import { NextRequest, NextResponse } from 'next/server'
import { getSeatAvailability } from '@/services/registration.service'

export const dynamic = 'force-dynamic'

// Public — lets the package detail/registration pages show "X seats
// left" without exposing the underlying registrations list.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const availability = await getSeatAvailability(id)
  return NextResponse.json(availability)
}
