import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/services/auth.service'
import { apiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    await verifyEmail(token)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
