import mongoose, { Schema, Document } from 'mongoose'
import type { PackageCategory, PackageStatus } from '@/types'

export interface IPackageItineraryDay {
  day: number
  title: string
  description: string
}

export interface IPackageFAQ {
  question: string
  answer: string
}

export interface IPackage extends Document {
  title: string
  slug: string
  category: PackageCategory
  status: PackageStatus
  isArchived: boolean
  description: string
  shortDescription?: string
  price: number
  duration: { days: number; nights: number }
  totalSeats: number
  images: string[]
  gallery: string[]
  itinerary: IPackageItineraryDay[]
  pickupPoints: string[]
  includedServices: string[]
  excludedServices: string[]
  faqs: IPackageFAQ[]
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  paymentNote?: string
  qrImages: string[]
  createdAt: Date
  updatedAt: Date
}

// _id: false — these are structured content fields (itinerary day-by-day,
// FAQ pairs), not independently addressable sub-resources, so there's no
// need for Mongoose to mint an ObjectId per array entry.
const ItineraryDaySchema = new Schema<IPackageItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
  },
  { _id: false }
)

const FAQSchema = new Schema<IPackageFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
  },
  { _id: false }
)

const PACKAGE_CATEGORIES: PackageCategory[] = [
  'spiritual',
  'holiday',
  'weekend',
  'family',
  'corporate',
  'pilgrimage',
]
const PACKAGE_STATUSES: PackageStatus[] = ['draft', 'published', 'hidden']

const PackageSchema = new Schema<IPackage>(
  {
    title: { type: String, required: true, trim: true },
    // Unique + indexed: slugs back SEO-friendly package URLs
    // (/packages/[slug]) — see services/package.service.ts for the
    // generation + collision-handling logic.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, enum: PACKAGE_CATEGORIES, default: 'spiritual', index: true },
    status: { type: String, enum: PACKAGE_STATUSES, default: 'draft', index: true },
    // Separate from `status` on purpose: archiving is a "take this out of
    // rotation" action an admin can apply regardless of publish state
    // (e.g. archive a published package that's been discontinued, without
    // losing its status history), matching the distinct "Archive Package"
    // action requested alongside the draft/published/hidden status set.
    isArchived: { type: Boolean, default: false, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    duration: {
      days: { type: Number, required: true, default: 1 },
      nights: { type: Number, required: true, default: 0 },
    },
    totalSeats: { type: Number, default: 50 },
    images: [{ type: String }],
    gallery: [{ type: String }],
    itinerary: [ItineraryDaySchema],
    pickupPoints: [{ type: String }],
    includedServices: [{ type: String }],
    excludedServices: [{ type: String }],
    faqs: [FAQSchema],
    featured: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    // Phase 5 QR payment verification: admin can attach one or more QR
    // codes + a payment note to a package; Registration's payment step
    // (services/registration.service.ts) reads these to render "how to
    // pay" instructions. Both optional/additive — existing Package docs
    // created before Phase 5 remain perfectly valid (qrImages defaults to []).
    paymentNote: { type: String },
    qrImages: [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema)
