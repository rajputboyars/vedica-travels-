import { NextRequest, NextResponse } from 'next/server'
import { cancelRegistration, getRegistration, isRegistrationOwner } from '@/services/registration.service'
import { requireAuth } from '@/lib/auth-guard'
import { AuthError } from '@/lib/auth-error'
import { apiError } from '@/lib/api-error'

// Phase 7 -- admin cancels a booking: releases its seat and auto-promotes
// the oldest waiting-list entry for the same package, if any (see
// cancelRegistration() in registration.service.ts).
//
// Phase 9 additive: the customer who owns this booking can also cancel it
// themselves ("Cancel Booking" in the Customer Dashboard) -- same
// ownership check as GET /api/registrations/[id].
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await requireAuth()
    if (user.role !== 'admin') {
      const existing = await getRegistration(id)
      if (!existing) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      if (!isRegistrationOwner(existing, user)) throw new AuthError('Insufficient permissions', 403)
    }
    const body = await req.json().catch(() => ({}))
    const registration = await cancelRegistration(id, typeof body.reason === 'string' ? body.reason : undefined)
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
