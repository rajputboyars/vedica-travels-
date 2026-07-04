import { NextRequest, NextResponse } from 'next/server'
import { getRegistrationByBookingId } from '@/services/registration.service'

export const dynamic = 'force-dynamic'

// Public — this is how a customer checks their own registration/payment
// status without an account: they hold the bookingId (emailed to them +
// shown right after registering), which acts as their access token. No
// admin-only PII listing is exposed this way, only a single record for
// whoever already has its booking ID.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params
  const registration = await getRegistrationByBookingId(bookingId)
  if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  return NextResponse.json(registration)
}
