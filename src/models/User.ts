import mongoose, { Schema, Document } from 'mongoose'
import type { UserRole, AuthProvider } from '@/types'

// Auth data lives in its own model, independent of Tour/Booking/Gallery —
// nothing here modifies those schemas, so this plugs in as a standalone
// module per the "new features as independent modules" rule.
//
// `provider`/`providerId` exist now (unused) so Google login can be added
// later purely by adding a new provider branch in auth.service.ts and a
// migration for existing `credentials` users — no schema change needed.
export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  role: UserRole
  provider: AuthProvider
  providerId?: string

  emailVerified: boolean
  emailVerificationTokenHash?: string
  emailVerificationExpires?: Date

  passwordResetTokenHash?: string
  passwordResetExpires?: Date

  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // select:false on every sensitive field — a plain `User.find()` never
    // leaks hashes/tokens; call `.select('+passwordHash')` etc. explicitly
    // in the handful of places (login, reset) that actually need them.
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    providerId: { type: String, index: true, sparse: true },

    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
