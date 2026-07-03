import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { changePassword } from '@/services/auth.service'
import { apiError } from '@/lib/api-error'

// Phase 8/9 — used by both the Admin Profile page and the Customer
// Dashboard. Requires the current password (not just a valid session) so
// a hijacked/left-open session can't silently take over the account.
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'currentPassword and newPassword are required' }, { status: 400 })
    }
    await changePassword(user._id, { currentPassword, newPassword })
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
