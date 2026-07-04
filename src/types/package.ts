// Package = the sellable product/catalog entity (e.g. "4 Dham Yatra"),
// managed by admins independently of Tour. Tour remains the bookable,
// dated departure/batch (see models/Tour.ts) — nothing here changes how
// Tour/Booking work. This separation lets a future booking system book
// against a specific Package (and, later, a specific departure batch of
// that Package) without any changes to this module's API surface.
//
// Phase 4/5 update: the "future booking system" arrived — see
// types/registration.ts. Registration.packageId points here, and
// paymentNote/qrImages below are exactly what a Registration's payment
// step displays (mirrors Tour.paymentNote/qrImage, now plural since
// Phase 5 asks for "one or multiple QR Codes").

// Six marketing categories requested for packages — intentionally a
// separate type from config/theme.ts's TourCategory (spiritual/leisure),
// which only covers the existing Tour model.
export type PackageCategory =
  | 'spiritual'
  | 'holiday'
  | 'weekend'
  | 'family'
  | 'corporate'
  | 'pilgrimage'

// Publishing/visibility state — distinct from "archived" (see isArchived
// on Package below). A package can be archived while still carrying
// whatever status it had; archiving is a separate lifecycle action from
// draft -> published -> hidden.
export type PackageStatus = 'draft' | 'published' | 'hidden'

export interface PackageItineraryDay {
  day: number
  title: string
  description: string
}

export interface PackageFAQ {
  question: string
  answer: string
}

export interface PackageDuration {
  days: number
  nights: number
}

// Plain-data DTO shape used above the service layer (client + server
// components), mirroring the Tour/Booking DTO pattern in types/tour.ts.
export interface Package {
  _id: string
  title: string
  slug: string
  category: PackageCategory
  status: PackageStatus
  isArchived: boolean
  description: string
  shortDescription?: string
  price: number
  duration: PackageDuration
  totalSeats: number
  images: string[]
  gallery: string[]
  itinerary: PackageItineraryDay[]
  pickupPoints: string[]
  includedServices: string[]
  excludedServices: string[]
  faqs: PackageFAQ[]
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  // Payment instructions shown on the registration/payment step for any
  // Registration booked against this package (see types/registration.ts).
  // Optional + additive so every existing Package document remains valid.
  paymentNote?: string
  qrImages?: string[]
  createdAt: string
  updatedAt: string
}

// slug is optional on input — the service auto-generates it from the
// title when omitted (see slugify()/ensureUniqueSlug() in
// services/package.service.ts).
export type PackageInput = Omit<Package, '_id' | 'slug' | 'isArchived' | 'createdAt' | 'updatedAt'> & {
  slug?: string
  isArchived?: boolean
}
