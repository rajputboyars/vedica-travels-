import { NextResponse } from 'next/server'
import { listMyRegistrations } from '@/services/registration.service'
import { requireAuth } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Phase 9 — "My Trips"/"Booking History" for the Customer Dashboard. Any
// logged-in user (not just admins) can call this; it only ever returns
// bookings that match their own userId/email — see
// listMyRegistrations()/isRegistrationOwner() in registration.service.ts.
export async function GET() {
  try {
    const user = await requireAuth()
    const registrations = await listMyRegistrations(user)
    return NextResponse.json(registrations)
  } catch (e) {
    return apiError(e)
  }
}
