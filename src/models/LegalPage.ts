import mongoose, { Schema, Document } from 'mongoose'
import type { LegalPageType } from '@/types'

// One document per policy (terms/privacy/refund) — a fixed, known set of
// three, not an open-ended collection, so `type` is unique rather than a
// free-text slug. See cms.service.ts getLegalPage()/upsertLegalPage().
export interface ILegalPage extends Document {
  type: LegalPageType
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const LEGAL_PAGE_TYPES: LegalPageType[] = ['terms', 'privacy', 'refund']

const LegalPageSchema = new Schema<ILegalPage>(
  {
    type: { type: String, enum: LEGAL_PAGE_TYPES, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.LegalPage || mongoose.model<ILegalPage>('LegalPage', LegalPageSchema)
