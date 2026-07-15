import mongoose, { Schema, Document } from 'mongoose'
import type { ExpenseType, ExpensePaymentStatus, ExpenseCategory } from '@/types'

// Travel Finance module. One document per expense line on a Tour. `total`
// is intentionally NOT stored — for variable expenses it depends on the
// live confirmed-passenger count, so it is always computed in
// finance.service.ts. Vendor is an optional reference (an expense can be
// paid to a tracked Vendor, or left unlinked).
export interface ITripExpense extends Document {
  tourId: mongoose.Types.ObjectId
  name: string
  category: ExpenseCategory
  description?: string
  type: ExpenseType
  quantity: number
  rate: number
  vendorId?: mongoose.Types.ObjectId
  paymentStatus: ExpensePaymentStatus
  amountPaid: number
  expenseDate: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TripExpenseSchema = new Schema<ITripExpense>(
  {
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['transport', 'fuel', 'salary', 'accommodation', 'food', 'refreshments', 'guide', 'darshan', 'photography', 'miscellaneous'],
      default: 'miscellaneous',
    },
    description: { type: String },
    type: { type: String, enum: ['fixed', 'variable'], default: 'fixed' },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    amountPaid: { type: Number, default: 0 },
    expenseDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.TripExpense || mongoose.model<ITripExpense>('TripExpense', TripExpenseSchema)
