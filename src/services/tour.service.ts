import { isDBConfigured } from '@/config/env'
import { DEMO_TOURS } from '@/lib/demo/tours'
import type { Tour, TourInput } from '@/types'
import { serialize } from './serialize'

// Every read/write to tour data goes through this module. Route handlers
// and server components should never import Tour (the Mongoose model) or
// the demo store directly — that guarantees demo mode and DB mode behave
// identically everywhere (the previous app's edit-tour page bypassed this
// and broke in demo mode; can't happen if there's only one door in).
async function db() {
  const [{ default: connectDB }, { default: Tour }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Tour'),
  ])
  await connectDB()
  return Tour
}

export async function listTours(): Promise<Tour[]> {
  if (!isDBConfigured) return DEMO_TOURS
  try {
    const Tour = await db()
    const tours = await Tour.find({}).sort({ startDate: 1 })
    return serialize(tours)
  } catch {
    return DEMO_TOURS
  }
}

export async function getTour(id: string): Promise<Tour | null> {
  if (!isDBConfigured) return DEMO_TOURS.find((t) => t._id === id) ?? null
  try {
    const Tour = await db()
    const tour = await Tour.findById(id)
    return tour ? serialize(tour) : null
  } catch {
    return null
  }
}

export async function createTour(data: TourInput): Promise<Tour> {
  if (!isDBConfigured) throw new Error('Database not configured')
  const Tour = await db()
  const tour = await Tour.create(data)
  return serialize(tour)
}

export async function updateTour(id: string, data: Partial<TourInput>): Promise<Tour | null> {
  if (!isDBConfigured) throw new Error('Database not configured')
  const Tour = await db()
  const tour = await Tour.findByIdAndUpdate(id, data, { new: true })
  return tour ? serialize(tour) : null
}

export async function deleteTour(id: string): Promise<boolean> {
  if (!isDBConfigured) throw new Error('Database not configured')
  const Tour = await db()
  await Tour.findByIdAndDelete(id)
  return true
}
