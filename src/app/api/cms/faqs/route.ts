import { NextRequest, NextResponse } from 'next/server'
import { listFAQs, createFAQ } from '@/services/cms.service'
import { getCurrentUser, requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  const faqs = await listFAQs({ publishedOnly: !isAdmin })
  return NextResponse.json(faqs)
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const faq = await createFAQ(body)
    return NextResponse.json(faq, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
