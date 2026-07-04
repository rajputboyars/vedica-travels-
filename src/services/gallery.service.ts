import { isDBConfigured } from '@/config/env'
import * as demo from '@/lib/demo/gallery'
import type { GalleryImage } from '@/types'
import { serialize } from './serialize'

async function db() {
  const [{ default: connectDB }, { default: Gallery }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Gallery'),
  ])
  await connectDB()
  return Gallery
}

export async function listImages(): Promise<GalleryImage[]> {
  if (!isDBConfigured) return demo.getImages()
  try {
    const Gallery = await db()
    const images = await Gallery.find({}).sort({ createdAt: -1 })
    return serialize(images)
  } catch {
    return []
  }
}

export async function addImage(data: Partial<GalleryImage>): Promise<GalleryImage> {
  if (!isDBConfigured) return demo.addImage(data)
  const Gallery = await db()
  const image = await Gallery.create(data)
  return serialize(image)
}

export async function deleteImage(id: string): Promise<boolean> {
  if (!isDBConfigured) return demo.deleteImage(id)
  const Gallery = await db()
  await Gallery.findByIdAndDelete(id)
  return true
}
