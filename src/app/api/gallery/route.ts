import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Gallery from '@/models/Gallery'

export async function GET() {
  try {
    await connectDB()
    const images = await Gallery.find({}).sort({ createdAt: -1 })
    return NextResponse.json(images)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const image = await Gallery.create(body)
    return NextResponse.json(image, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}
