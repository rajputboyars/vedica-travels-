import { NextRequest, NextResponse } from 'next/server'
import { approvePayment } from '@/services/registration.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// Phase 5 "Approve Payment" admin action — Payment Status -> Verified,
// Booking Status -> Confirmed, seat count decreases (see
// registration.service.ts approvePayment()).
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const registration = await approvePayment(id)
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
