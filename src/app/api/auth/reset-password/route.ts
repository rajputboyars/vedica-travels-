import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/services/auth.service'
import { apiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    await resetPassword(token, password)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
