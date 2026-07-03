import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/services/auth.service'
import { apiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    await requestPasswordReset(email)
    // Generic message regardless of outcome — see requestPasswordReset's
    // doc comment on why (avoids leaking which emails have accounts).
    return NextResponse.json({ message: 'If an account exists for that email, a reset link has been sent.' })
  } catch (e) {
    return apiError(e)
  }
}
