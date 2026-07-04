import mongoose, { Schema, Document } from 'mongoose'

export interface IHeroBanner {
  badgeText: string
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

export interface ICategoryTile {
  title: string
  subtitle: string
  image: string
  href: string
}

export interface IWhyTravelItem {
  title: string
  description: string
}

// Singleton — same "exactly one document" pattern as SiteSettings. Every
// field here backs a section of the public homepage
// (src/app/(public)/page.tsx) that used to be hardcoded JSX.
export interface IHomepageContent extends Document {
  hero: IHeroBanner
  categoryTiles: ICategoryTile[]
  whyTravelWithUs: IWhyTravelItem[]
  ctaTitle: string
  ctaSubtitle: string
  createdAt: Date
  updatedAt: Date
}

const CategoryTileSchema = new Schema<ICategoryTile>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    href: { type: String, default: '' },
  },
  { _id: false }
)

const WhyTravelItemSchema = new Schema<IWhyTravelItem>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
)

const HomepageContentSchema = new Schema<IHomepageContent>(
  {
    hero: {
      badgeText: { type: String, default: '' },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      description: { type: String, default: '' },
      backgroundImage: { type: String, default: '' },
      primaryCtaLabel: { type: String, default: '' },
      primaryCtaHref: { type: String, default: '' },
      secondaryCtaLabel: { type: String, default: '' },
      secondaryCtaHref: { type: String, default: '' },
    },
    categoryTiles: [CategoryTileSchema],
    whyTravelWithUs: [WhyTravelItemSchema],
    ctaTitle: { type: String, default: '' },
    ctaSubtitle: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.HomepageContent || mongoose.model<IHomepageContent>('HomepageContent', HomepageContentSchema)
