import { isDBConfigured } from '@/config/env'
import * as demo from '@/lib/demo/expenses'
import type { TripExpense, TripExpenseInput } from '@/types'
import { serialize } from './serialize'

// Travel Finance module — all TripExpense reads/writes go through here, same
// service pattern as tour.service.ts (demo store vs Mongoose, one door in).
async function db() {
  const [{ default: connectDB }, { default: TripExpense }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/TripExpense'),
  ])
  await connectDB()
  return TripExpense
}

export async function listExpensesByTour(tourId: string): Promise<TripExpense[]> {
  if (!isDBConfigured) return demo.getExpensesByTour(tourId)
  try {
    const TripExpense = await db()
    const docs = await TripExpense.find({ tourId }).sort({ createdAt: -1 })
    return serialize(docs)
  } catch {
    return []
  }
}

export async function listAllExpenses(): Promise<TripExpense[]> {
  if (!isDBConfigured) return demo.getExpenses()
  try {
    const TripExpense = await db()
    const docs = await TripExpense.find({}).sort({ createdAt: -1 })
    return serialize(docs)
  } catch {
    return []
  }
}

export async function getExpense(id: string): Promise<TripExpense | null> {
  if (!isDBConfigured) return demo.getExpense(id) ?? null
  try {
    const TripExpense = await db()
    const doc = await TripExpense.findById(id)
    return doc ? serialize(doc) : null
  } catch {
    return null
  }
}

export async function createExpense(data: Partial<TripExpenseInput>): Promise<TripExpense> {
  if (!isDBConfigured) return demo.addExpense(data as Partial<TripExpense>)
  const TripExpense = await db()
  const doc = await TripExpense.create(data)
  return serialize(doc)
}

export async function updateExpense(id: string, data: Partial<TripExpenseInput>): Promise<TripExpense | null> {
  if (!isDBConfigured) return demo.updateExpense(id, data as Partial<TripExpense>) ?? null
  const TripExpense = await db()
  const doc = await TripExpense.findByIdAndUpdate(id, data, { new: true })
  return doc ? serialize(doc) : null
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!isDBConfigured) return demo.deleteExpense(id)
  const TripExpense = await db()
  await TripExpense.findByIdAndDelete(id)
  return true
}
