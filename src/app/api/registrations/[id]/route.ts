import { NextRequest, NextResponse } from 'next/server'
import { getRegistration, isRegistrationOwner } from '@/services/registration.service'
import { requireAuth } from '@/lib/auth-guard'
import { AuthError } from '@/lib/auth-error'
import { apiError } from '@/lib/api-error'

// Admin gets any registration by id. Phase 9 additive: a logged-in
// customer can also fetch their own registration by id (the Customer
// Dashboard's booking detail page needs this) -- anyone else gets 403, and
// anonymous customer-facing lookups still go through
// /api/registrations/lookup/[bookingId] instead, keyed by the booking ID
// the customer actually holds.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await requireAuth()
    const registration = await getRegistration(id)
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    if (user.role !== 'admin' && !isRegistrationOwner(registration, user)) {
      throw new AuthError('Insufficient permissions', 403)
    }
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
