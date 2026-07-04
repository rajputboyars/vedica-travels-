import mongoose, { Schema, Document } from 'mongoose'

export interface ITestimonial extends Document {
  name: string
  location?: string
  rating: number
  message: string
  avatar?: string
  published: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    message: { type: String, required: true },
    avatar: { type: String },
    // Only 'published' testimonials render on the public homepage — draft
    // ones can be prepared in the admin CMS and flipped live later,
    // matching the draft/published pattern already used by Package.
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema)
