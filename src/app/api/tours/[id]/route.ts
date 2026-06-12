import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TOURS } from '@/lib/demo-data'

const isDBConfigured = !!process.env.MONGODB_URI

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    const tour = DEMO_TOURS.find(t => t._id === id)
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(tour)
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Tour } = await import('@/models/Tour')
    await connectDB()
    const tour = await Tour.findById(id)
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(tour)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isDBConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Tour } = await import('@/models/Tour')
    await connectDB()
    const body = await req.json()
    const tour = await Tour.findByIdAndUpdate(id, body, { new: true })
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
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Tour } = await import('@/models/Tour')
    await connectDB()
    await Tour.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
  }
}
