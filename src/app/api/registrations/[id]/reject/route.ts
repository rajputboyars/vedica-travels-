import { NextRequest, NextResponse } from 'next/server'
import { rejectPayment } from '@/services/registration.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// Phase 5 "Reject Payment" admin action — reason is required, it's
// emailed straight to the customer (spec: "Customer receives reason").
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const { reason } = await req.json()
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 })
    }
    const registration = await rejectPayment(id, reason)
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    return NextResponse.json(registration)
  } catch (e) {
    return apiError(e)
  }
}
