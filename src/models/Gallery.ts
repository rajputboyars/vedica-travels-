import mongoose, { Schema, Document } from 'mongoose'

export interface IGallery extends Document {
  url: string
  caption?: string
  tourId?: mongoose.Types.ObjectId
  createdAt: Date
}

const GallerySchema = new Schema<IGallery>({
  url: { type: String, required: true },
  caption: { type: String },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour' },
}, { timestamps: true })

export default mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema)
