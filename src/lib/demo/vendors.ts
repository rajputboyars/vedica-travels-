// In-memory Vendor store used when MONGODB_URI is not configured (same
// pattern as demo/bookings.ts). Seeded so the finance module is
// demonstrable without a database; resets on server restart.
import type { Vendor } from '@/types'

type Store = { vendors: Vendor[]; seeded: boolean }

const g = global as unknown as { __demoVendorStore?: Store }

if (!g.__demoVendorStore) {
  g.__demoVendorStore = { vendors: [], seeded: false }
}

const store = g.__demoVendorStore

function now() {
  return new Date().toISOString()
}

function seed() {
  if (store.seeded) return
  store.seeded = true
  store.vendors = [
    { _id: 'demo-vendor-1', name: 'Sharma Travels (Bus)', type: 'bus', phone: '9811100001', email: 'sharma.bus@example.com', address: 'Noida Sec 63', bankDetails: 'HDFC ****1234', notes: 'AC Volvo 2x2, 50-seater', createdAt: now(), updatedAt: now() },
    { _id: 'demo-vendor-2', name: 'Shyam Bhojnalaya', type: 'restaurant', phone: '9811100002', address: 'Khatu, Rajasthan', createdAt: now(), updatedAt: now() },
    { _id: 'demo-vendor-3', name: 'Hotel Shyam Residency', type: 'hotel', phone: '9811100003', email: 'stay@shyamresidency.example.com', createdAt: now(), updatedAt: now() },
    { _id: 'demo-vendor-4', name: 'Ravi Fuel Station', type: 'fuel', phone: '9811100004', createdAt: now(), updatedAt: now() },
  ]
}

export function getVendors(): Vendor[] {
  seed()
  return store.vendors
}

export function getVendor(id: string): Vendor | undefined {
  return getVendors().find((v) => v._id === id)
}

export function addVendor(data: Partial<Vendor>): Vendor {
  seed()
  const vendor: Vendor = {
    _id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    name: data.name || '',
    type: data.type || 'other',
    phone: data.phone,
    email: data.email,
    address: data.address,
    bankDetails: data.bankDetails,
    notes: data.notes,
    createdAt: now(),
    updatedAt: now(),
  }
  store.vendors.unshift(vendor)
  return vendor
}

export function updateVendor(id: string, data: Partial<Vendor>): Vendor | undefined {
  const v = getVendor(id)
  if (!v) return undefined
  Object.assign(v, data, { updatedAt: now() })
  return v
}

export function deleteVendor(id: string): boolean {
  seed()
  const idx = store.vendors.findIndex((v) => v._id === id)
  if (idx === -1) return false
  store.vendors.splice(idx, 1)
  return true
}
