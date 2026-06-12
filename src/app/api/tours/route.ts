import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tour from '@/models/Tour'

export async function GET() {
  try {
    await connectDB()
    const tours = await Tour.find({}).sort({ startDate: 1 })
    return NextResponse.json(tours)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const tour = await Tour.create(body)
    return NextResponse.json(tour, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
  }
}
