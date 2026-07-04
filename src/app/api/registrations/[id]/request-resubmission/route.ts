import { NextRequest, NextResponse } from 'next/server'
import { requestResubmission } from '@/services/registration.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// Phase 5 "Request New Screenshot" admin action — distinct from Reject
// (see the comment on paymentReviewNote in types/registration.ts).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const { reason } = await req.json()
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Please explain what needs to be resubmitted' }, { status: 400 })
    }
    const registration = await requestResubmission(id, reason)
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
