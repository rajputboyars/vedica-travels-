import { NextRequest, NextResponse } from 'next/server'
import { getLegalPage, upsertLegalPage } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'
import type { LegalPageType } from '@/types'

const VALID_TYPES: LegalPageType[] = ['terms', 'privacy', 'refund']

function parseType(raw: string): LegalPageType | null {
  return (VALID_TYPES as string[]).includes(raw) ? (raw as LegalPageType) : null
}

// GET is public (Terms/Privacy/Refund pages are visited by any visitor).
// PUT is admin-only (Phase 10 CMS).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const parsed = parseType(type)
  if (!parsed) return NextResponse.json({ error: 'Unknown legal page type' }, { status: 404 })
  const page = await getLegalPage(parsed)
  return NextResponse.json(page)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const parsed = parseType(type)
  if (!parsed) return NextResponse.json({ error: 'Unknown legal page type' }, { status: 404 })
  try {
    await requireRole('admin')
    const body = await req.json()
    const page = await upsertLegalPage(parsed, body)
    return NextResponse.json(page)
  } catch (e) {
    return apiError(e)
  }
}
