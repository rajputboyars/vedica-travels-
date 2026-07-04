import mongoose, { Schema, Document } from 'mongoose'

// Singleton document — see cms.service.ts getSiteSettings() for the
// "find one, create default on first read" pattern. There is intentionally
// no unique-slug/key field: the service enforces "exactly one document"
// by always querying/updating the first (and only) one.
export interface ISiteSettings extends Document {
  siteName: string
  shortName: string
  tagline: string
  taglineEn: string
  description: string
  founder: string
  contact: {
    phones: string[]
    primaryPhone: string
    whatsapp: string
    email: string
    availability: string
  }
  address: {
    line1: string
    line2: string
    pickupLabel: string
  }
  social: {
    instagram?: string
    facebook?: string
    youtube?: string
    twitter?: string
  }
  stats: {
    happyTravellers: string
    tripsCompleted: string
    destinations: string
    averageRating: string
  }
  createdAt: Date
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, required: true },
    shortName: { type: String, required: true },
    tagline: { type: String, default: '' },
    taglineEn: { type: String, default: '' },
    description: { type: String, default: '' },
    founder: { type: String, default: '' },
    contact: {
      phones: [{ type: String }],
      primaryPhone: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      email: { type: String, default: '' },
      availability: { type: String, default: '' },
    },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      pickupLabel: { type: String, default: '' },
    },
    social: {
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
      twitter: { type: String },
    },
    stats: {
      happyTravellers: { type: String, default: '' },
      tripsCompleted: { type: String, default: '' },
      destinations: { type: String, default: '' },
      averageRating: { type: String, default: '' },
    },
  },
  // minimize: false -- by default Mongoose strips empty nested objects
  // (e.g. `social: {}` when no admin has set any social link yet) before
  // saving. That stripped the whole `social` key from the document, so
  // any later read got `settings.social === undefined` instead of `{}`,
  // crashing `Object.values(settings.social)` in the public layout and
  // the admin settings form. Keeping the key (even empty) matches what
  // the demo store always returns and is what every consumer expects.
  { timestamps: true, minimize: false }
)

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)
