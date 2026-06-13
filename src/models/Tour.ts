import mongoose, { Schema, Document } from 'mongoose'

export interface ITour extends Document {
  title: string
  description: string
  route: string
  startDate: Date
  endDate: Date
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
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  category: 'spiritual' | 'leisure'
  featured: boolean
  createdAt: Date
}

const TourSchema = new Schema<ITour>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  route: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  services: [{ type: String }],
  inclusions: [{ type: String }],
  pickupPoints: [{ type: String }],
  image: { type: String },
  qrImage: { type: String },
  paymentNote: { type: String },
  departureTime: { type: String, default: '08:30 PM' },
  totalSeats: { type: Number, default: 50 },
  availableSeats: { type: Number, default: 50 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  category: { type: String, enum: ['spiritual', 'leisure'], default: 'spiritual' },
  featured: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema)
