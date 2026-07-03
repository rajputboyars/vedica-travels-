import type { TourCategory } from '@/config/theme'

export type TourStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

// Plain-data shape used on the client (after JSON serialization — no
// Mongoose Document methods, dates are ISO strings). The Mongoose
// interface (ITour) lives in models/Tour.ts for the DB layer; this is
// the DTO everything above the service layer should depend on.
export interface Tour {
  _id: string
  title: string
  description: string
  route: string
  startDate: string
  endDate: string
  price: number
  services: string[]
  inclusions: string[]
  pickupPoints: string[]
  image?: string
  qrImage?: string
  paymentNote?: string
  departureTime: string
  totalSeats: number
  availableSeats: number
  status: TourStatus
  category: TourCategory
  featured: boolean
  createdAt: string
}

export type TourInput = Omit<Tour, '_id' | 'createdAt'>
