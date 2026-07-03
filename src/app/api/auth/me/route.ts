import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth-guard'
import { updateProfile } from '@/services/auth.service'
import { apiError } from '@/lib/api-error'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null }, { status: 401 })
  return NextResponse.json({ user })
}

// Phase 8/9 — "Edit Profile" for both the admin profile page and the
// customer dashboard: any logged-in user (admin or customer) can update
// their own name. Deliberately narrow (name only, no email/role change
// here) — email changes would need re-verification and role changes are
// an admin-only concern, neither of which this endpoint does.
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const updated = await updateProfile(user._id, { name: body.name })
    return NextResponse.json({ user: updated })
  } catch (e) {
    return apiError(e)
  }
}
