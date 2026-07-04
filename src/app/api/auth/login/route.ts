import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/services/auth.service'
import { setAuthCookie } from '@/lib/auth-cookie'
import { apiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user, token } = await loginUser(body)
    const res = NextResponse.json({ user })
    setAuthCookie(res, token)
    return res
  } catch (e) {
    return apiError(e)
  }
}
