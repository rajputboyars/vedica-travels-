import mongoose, { Schema, Document } from 'mongoose'
import type { Gender, IdType, RegistrationStatus, RegistrationPaymentStatus, SeatStatus } from '@/types'

export interface IRegistration extends Document {
  bookingId: string
  packageId: mongoose.Types.ObjectId
  packageTitle: string
  name: string
  age: number
  gender: Gender
  mobile: string
  email: string
  address: string
  city: string
  state: string
  emergencyContactName: string
  emergencyContactPhone: string
  idType: IdType
  idNumber: string
  travelDate: Date
  numPersons: number
  specialRequests?: string
  status: RegistrationStatus
  seatStatus: SeatStatus
  paymentStatus: RegistrationPaymentStatus
  paymentScreenshot?: string
  transactionId?: string
  upiId?: string
  paymentAmount?: number
  paymentSubmittedAt?: Date
  paymentReviewNote?: string
  paymentReviewedAt?: Date
  reminderSentAt?: Date
  cancellationReason?: string
  userId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    // Indexed + unique: this is the customer-facing reference number
    // (see demo/registrations.ts genBookingId() / lookup route).
    bookingId: { type: String, required: true, unique: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true, index: true },
    packageTitle: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },
    idType: { type: String, enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'], required: true },
    idNumber: { type: String, required: true },
    travelDate: { type: Date, required: true },
    numPersons: { type: Number, required: true, default: 1 },
    specialRequests: { type: String },

    status: { type: String, enum: ['pending_payment', 'confirmed', 'cancelled'], default: 'pending_payment', index: true },
    // 'reserved' (temporary hold, doesn't count against public seat
    // availability) -> 'confirmed' (payment verified, now counted) ->
    // 'released' (hold freed, e.g. cancelled). 'waiting_list' (Phase 7):
    // assigned at registration time when the package was full. See
    // types/registration.ts.
    seatStatus: { type: String, enum: ['reserved', 'confirmed', 'released', 'waiting_list'], default: 'reserved', index: true },

    paymentStatus: {
      type: String,
      enum: ['not_submitted', 'waiting_verification', 'verified', 'rejected', 'resubmission_requested'],
      default: 'not_submitted',
      index: true,
    },
    paymentScreenshot: { type: String },
    transactionId: { type: String },
    upiId: { type: String },
    paymentAmount: { type: Number },
    paymentSubmittedAt: { type: Date },
    paymentReviewNote: { type: String },
    paymentReviewedAt: { type: Date },
    // Phase 6 trip reminders — set once, checked by sendTripReminders() so
    // a daily cron run is idempotent (never double-sends).
    reminderSentAt: { type: Date },
    // Phase 7 — admin-provided reason when cancelling a booking.
    cancellationReason: { type: String },
    // Phase 9 — set when the customer was logged in at registration time.
    // Optional/nullable: registering never requires an account (see
    // createRegistration() in registration.service.ts).
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
  },
  { timestamps: true }
)

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema)
