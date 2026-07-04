// Demo-mode gallery store. The original app only had a DB-backed gallery
// (no demo fallback), which meant the admin gallery page would 500 in demo
// mode. Adding this brings gallery in line with tours/bookings so every
// admin section works consistently with or without MONGODB_URI configured.
import type { GalleryImage } from '@/types'

type Store = { images: GalleryImage[] }

const g = global as unknown as { __demoGalleryStore?: Store }

if (!g.__demoGalleryStore) {
  g.__demoGalleryStore = {
    images: [
      {
        _id: 'demo-gallery-1',
        url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&q=80&auto=format&fit=crop',
        caption: 'Khatu Shyam Ji Yatra',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'demo-gallery-2',
        url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&q=80&auto=format&fit=crop',
        caption: 'Manali Adventure',
        createdAt: new Date().toISOString(),
      },
    ],
  }
}

const store = g.__demoGalleryStore

export function getImages(): GalleryImage[] {
  return store.images
}

export function addImage(data: Partial<GalleryImage>): GalleryImage {
  const image: GalleryImage = {
    _id: 'g-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    url: data.url || '',
    caption: data.caption,
    tourId: data.tourId,
    createdAt: new Date().toISOString(),
  }
  store.images.unshift(image)
  return image
}

export function deleteImage(id: string): boolean {
  const idx = store.images.findIndex((i) => i._id === id)
  if (idx === -1) return false
  store.images.splice(idx, 1)
  return true
}
