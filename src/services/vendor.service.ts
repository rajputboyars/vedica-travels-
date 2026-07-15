import { isDBConfigured } from '@/config/env'
import * as demo from '@/lib/demo/vendors'
import type { Vendor, VendorInput } from '@/types'
import { serialize } from './serialize'

// Travel Finance module — Vendor CRUD. Vendor payment totals are NOT stored
// here; they are derived from linked expenses in finance.service.ts.
async function db() {
  const [{ default: connectDB }, { default: Vendor }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Vendor'),
  ])
  await connectDB()
  return Vendor
}

export async function listVendors(): Promise<Vendor[]> {
  if (!isDBConfigured) return demo.getVendors()
  try {
    const Vendor = await db()
    const docs = await Vendor.find({}).sort({ name: 1 })
    return serialize(docs)
  } catch {
    return []
  }
}

export async function getVendor(id: string): Promise<Vendor | null> {
  if (!isDBConfigured) return demo.getVendor(id) ?? null
  try {
    const Vendor = await db()
    const doc = await Vendor.findById(id)
    return doc ? serialize(doc) : null
  } catch {
    return null
  }
}

export async function createVendor(data: Partial<VendorInput>): Promise<Vendor> {
  if (!isDBConfigured) return demo.addVendor(data as Partial<Vendor>)
  const Vendor = await db()
  const doc = await Vendor.create(data)
  return serialize(doc)
}

export async function updateVendor(id: string, data: Partial<VendorInput>): Promise<Vendor | null> {
  if (!isDBConfigured) return demo.updateVendor(id, data as Partial<Vendor>) ?? null
  const Vendor = await db()
  const doc = await Vendor.findByIdAndUpdate(id, data, { new: true })
  return doc ? serialize(doc) : null
}

export async function deleteVendor(id: string): Promise<boolean> {
  if (!isDBConfigured) return demo.deleteVendor(id)
  const Vendor = await db()
  await Vendor.findByIdAndDelete(id)
  return true
}
