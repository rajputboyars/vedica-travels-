import { NextRequest, NextResponse } from 'next/server'
import { listTours, createTour } from '@/services/tour.service'
import { isDBConfigured } from '@/config/env'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await listTours())
}

export async function POST(req: NextRequest) {
  if (!isDBConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const body = await req.json()
    const tour = await createTour(body)
    return NextResponse.json(tour, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
  }
}
