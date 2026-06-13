import mongoose, { Schema, Document } from 'mongoose'

export interface IPassenger {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  idType: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'voter_id'
  idNumber: string
  attendance: 'present' | 'absent' | 'not_marked'
}

export interface IBooking extends Document {
  bookingRef: string
  tourId: mongoose.Types.ObjectId
  tourTitle: string
  // Lead contact
  name: string
  phone: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  // Passengers
  passengers: IPassenger[]
  numPersons: number
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalAmount?: number
  // Payment
  paymentStatus: 'pending' | 'screenshot_received' | 'confirmed' | 'rejected'
  amountPaid: number
  paymentMethod?: string
  paymentRef?: string
  paymentScreenshot?: string
  paymentNote?: string
  isWalkIn?: boolean
  createdAt: Date
}

const PassengerSchema = new Schema<IPassenger>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  idType: { type: String, enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'], required: true },
  idNumber: { type: String, required: true },
  attendance: { type: String, enum: ['present', 'absent', 'not_marked'], default: 'not_marked' },
})

const BookingSchema = new Schema<IBooking>({
  bookingRef: { type: String, index: true },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  tourTitle: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  passengers: [PassengerSchema],
  numPersons: { type: Number, required: true, default: 1 },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number },
  // Payment
  paymentStatus: { type: String, enum: ['pending', 'screenshot_received', 'confirmed', 'rejected'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { type: String },
  paymentRef: { type: String },
  paymentScreenshot: { type: String },
  paymentNote: { type: String },
  isWalkIn: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
