import { NextRequest, NextResponse } from 'next/server'
import { listRegistrations, createRegistration } from '@/services/registration.service'
import { requireRole, getCurrentUser } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'
import type { RegistrationPaymentStatus, RegistrationStatus } from '@/types'

export const dynamic = 'force-dynamic'

// POST is public -- customers register without an account (Phase 4: "no
// online payment", registration itself needs no login either). GET is
// admin-only: the full registrations list is customer PII + payment
// details, not something to expose publicly.
//
// Phase 9: if the request happens to come from a logged-in customer, the
// new booking is tagged with their userId so it shows up in "My Trips"
// without them needing to match by email -- but this is opportunistic, not
// required, so anonymous registration keeps working exactly as before.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getCurrentUser()
    const userId = user?.role === 'customer' ? user._id : undefined
    const registration = await createRegistration(body, userId)
    return NextResponse.json(registration, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireRole('admin')
    const { searchParams } = req.nextUrl
    const status = (searchParams.get('status') as RegistrationStatus) || undefined
    const paymentStatus = (searchParams.get('paymentStatus') as RegistrationPaymentStatus) || undefined
    const packageId = searchParams.get('packageId') || undefined
    const q = searchParams.get('q') || undefined
    const registrations = await listRegistrations({ status, paymentStatus, packageId, q })
    return NextResponse.json(registrations)
  } catch (e) {
    return apiError(e)
  }
}
