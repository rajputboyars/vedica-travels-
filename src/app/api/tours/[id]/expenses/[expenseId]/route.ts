import { NextRequest, NextResponse } from 'next/server'
import { updateExpense, deleteExpense } from '@/services/expense.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  try {
    await requireRole('admin')
    const { expenseId } = await params
    const body = await req.json()
    const expense = await updateExpense(expenseId, body)
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    return NextResponse.json(expense)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  try {
    await requireRole('admin')
    const { expenseId } = await params
    await deleteExpense(expenseId)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
