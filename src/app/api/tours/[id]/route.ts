import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tour from '@/models/Tour'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    const tour = await Tour.findById(id)
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(tour)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
  try {
    const { id } = await params
    await connectDB()
    await Tour.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
  }
}
