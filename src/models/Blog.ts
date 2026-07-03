import mongoose, { Schema, Document } from 'mongoose'
import type { BlogStatus } from '@/types'

export interface IBlog extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: string
  tags: string[]
  status: BlogStatus
  publishedAt?: Date
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

const BLOG_STATUSES: BlogStatus[] = ['draft', 'published']

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    // Slug-based URLs (/blogs/[slug]) — same SEO-friendly pattern and
    // service-layer uniqueness handling as Package (see
    // cms.service.ts ensureUniqueBlogSlug()).
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    author: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: BLOG_STATUSES, default: 'draft', index: true },
    // Set once when status first becomes 'published' (see cms.service.ts)
    // — lets a "recently published" sort/filter exist without relying on
    // createdAt, which wouldn't move if a draft sat for a while first.
    publishedAt: { type: Date },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema)
