import mongoose, { Schema, Document } from 'mongoose'

export interface IFAQItem extends Document {
  question: string
  answer: string
  category?: string
  order: number
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const FAQItemSchema = new Schema<IFAQItem>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.models.FAQItem || mongoose.model<IFAQItem>('FAQItem', FAQItemSchema)
