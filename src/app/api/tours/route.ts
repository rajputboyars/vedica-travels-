import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TOURS } from '@/lib/demo-data'

const isDBConfigured = !!process.env.MONGODB_URI

export async function GET() {
  if (!isDBConfigured) {
    return NextResponse.json(DEMO_TOURS)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Tour } = await import('@/models/Tour')
    await connectDB()
    const tours = await Tour.find({}).sort({ startDate: 1 })
    return NextResponse.json(tours)
  } catch {
    return NextResponse.json(DEMO_TOURS)
  }
}

export async function POST(req: NextRequest) {
  if (!isDBConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Tour } = await import('@/models/Tour')
    await connectDB()
    const body = await req.json()
    const tour = await Tour.create(body)
    return NextResponse.json(tour, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
  }
}
