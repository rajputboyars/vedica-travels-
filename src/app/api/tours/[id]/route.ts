import { NextRequest, NextResponse } from 'next/server'
import { getTour, updateTour, deleteTour } from '@/services/tour.service'
import { isDBConfigured } from '@/config/env'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  return NextResponse.json(tour)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const body = await req.json()
    const tour = await updateTour(id, body)
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(tour)
  } catch {
    return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    await deleteTour(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
  }
}
