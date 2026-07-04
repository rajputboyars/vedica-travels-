import { NextRequest, NextResponse } from 'next/server'
import { listImages, addImage } from '@/services/gallery.service'

export async function GET() {
  return NextResponse.json(await listImages())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const image = await addImage(body)
    return NextResponse.json(image, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}
