import { NextRequest, NextResponse } from 'next/server'
import { registerUser, loginUser } from '@/services/auth.service'
import { setAuthCookie } from '@/lib/auth-cookie'
import { apiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await registerUser(body)
    // Auto-login on register for a smoother first-run experience; the
    // account is still marked emailVerified: false until they click the
    // link, so future gated features can check that flag.
    const { token } = await loginUser({ email: user.email, password: body.password })
    const res = NextResponse.json({ user }, { status: 201 })
    setAuthCookie(res, token)
    return res
  } catch (e) {
    return apiError(e)
  }
}
