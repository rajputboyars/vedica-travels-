import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth-cookie'

export async function POST() {
  const res = NextResponse.json({ success: true })
  clearAuthCookie(res)
  return res
}
