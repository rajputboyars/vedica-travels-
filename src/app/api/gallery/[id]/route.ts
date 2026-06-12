import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Gallery from '@/models/Gallery'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    await Gallery.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
