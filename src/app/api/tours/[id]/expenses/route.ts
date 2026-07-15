import { NextRequest, NextResponse } from 'next/server'
import { listExpensesByTour, createExpense } from '@/services/expense.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Travel Finance module — expense lines for one trip. Admin-only (finance
// data is sensitive), same guard/pattern as the CMS/Package write routes.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin')
    const { id } = await params
    return NextResponse.json(await listExpensesByTour(id))
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin')
    const { id } = await params
    const body = await req.json()
    const expense = await createExpense({ ...body, tourId: id })
    return NextResponse.json(expense, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
