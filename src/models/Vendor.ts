import mongoose, { Schema, Document } from 'mongoose'
import type { VendorType } from '@/types'

// Travel Finance module. A vendor an admin pays trip costs to (bus owner,
// hotel, restaurant, guide, fuel station, photographer). Outstanding/paid
// totals are NOT stored here — they are derived from linked TripExpense
// documents in vendor.service.ts to avoid duplication / drift.
export interface IVendor extends Document {
  name: string
  type: VendorType
  phone?: string
  email?: string
  address?: string
  bankDetails?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['bus', 'hotel', 'restaurant', 'guide', 'fuel', 'photographer', 'other'], default: 'other' },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    bankDetails: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema)
