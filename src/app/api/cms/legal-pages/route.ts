import { NextResponse } from 'next/server'
import { getAllLegalPages } from '@/services/cms.service'

export const dynamic = 'force-dynamic'

// Public — used by the Footer to link all three policy pages at once.
export async function GET() {
  const pages = await getAllLegalPages()
  return NextResponse.json(pages)
}
