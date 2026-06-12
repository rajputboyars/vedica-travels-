import mongoose, { Schema, Document } from 'mongoose'

export interface IBooking extends Document {
  tourId: mongoose.Types.ObjectId
  tourTitle: string
  name: string
  phone: string
  email?: string
  numPersons: number
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
}

const BookingSchema = new Schema<IBooking>({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  tourTitle: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  numPersons: { type: Number, required: true, default: 1 },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true })

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
