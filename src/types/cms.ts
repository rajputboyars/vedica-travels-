// Phase 10 — Admin CMS. Every field here was previously either hardcoded
// in a component (homepage hero copy, "Why Travel With Us" cards) or a
// frozen constant in config/site.ts (contact numbers, social links,
// stats). Moving it into MongoDB-backed documents means an admin can
// change any of it without a code deploy — see cms.service.ts for the
// read/write layer and config/site.ts's updated header comment for how
// the old constants now only serve as first-run seed data.

// ---- Site Settings (singleton) ---------------------------------------
// One document holds the handful of "about the business" fields that
// used to live in config/site.ts: contact info, social links, and the
// homepage stats bar. Singleton pattern (see getSiteSettings() in
// cms.service.ts) rather than a collection — there's exactly one site.
export interface SiteSettingsContact {
  phones: string[]
  primaryPhone: string
  whatsapp: string
  email: string
  availability: string
}

export interface SiteSettingsAddress {
  line1: string
  line2: string
  pickupLabel: string
}

export interface SiteSettingsSocial {
  instagram?: string
  facebook?: string
  youtube?: string
  twitter?: string
}

export interface SiteSettingsStats {
  happyTravellers: string
  tripsCompleted: string
  destinations: string
  averageRating: string
}

export interface SiteSettings {
  _id: string
  siteName: string
  shortName: string
  tagline: string
  taglineEn: string
  description: string
  founder: string
  contact: SiteSettingsContact
  address: SiteSettingsAddress
  social: SiteSettingsSocial
  stats: SiteSettingsStats
  updatedAt: string
}

export type SiteSettingsInput = Omit<SiteSettings, '_id' | 'updatedAt'>

// ---- Homepage Content (singleton) --------------------------------------
export interface HeroBanner {
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

export interface CategoryTile {
  title: string
  subtitle: string
  image: string
  href: string
}

export interface WhyTravelItem {
  title: string
  description: string
}

export interface HomepageContent {
  _id: string
  hero: HeroBanner
  categoryTiles: CategoryTile[]
  whyTravelWithUs: WhyTravelItem[]
  ctaTitle: string
  ctaSubtitle: string
  updatedAt: string
}

export type HomepageContentInput = Omit<HomepageContent, '_id' | 'updatedAt'>

// ---- Testimonials (collection) -----------------------------------------
export interface Testimonial {
  _id: string
  name: string
  location?: string
  rating: number
  message: string
  avatar?: string
  published: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type TestimonialInput = Omit<Testimonial, '_id' | 'createdAt' | 'updatedAt'>

// ---- Blogs (collection) -------------------------------------------------
export type BlogStatus = 'draft' | 'published'

export interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: string
  tags: string[]
  status: BlogStatus
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export type BlogInput = Omit<Blog, '_id' | 'slug' | 'publishedAt' | 'createdAt' | 'updatedAt'> & { slug?: string }

// ---- FAQs (collection) ---------------------------------------------------
export interface FAQItem {
  _id: string
  question: string
  answer: string
  category?: string
  order: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export type FAQItemInput = Omit<FAQItem, '_id' | 'createdAt' | 'updatedAt'>

// ---- Legal Pages (Terms / Privacy / Refund) ------------------------------
// One document per policy type rather than a free-text slug — a fixed,
// known set of three pages the site needs, not an open-ended collection.
export type LegalPageType = 'terms' | 'privacy' | 'refund'

export const legalPageLabels: Record<LegalPageType, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
}

export interface LegalPage {
  _id: string
  type: LegalPageType
  title: string
  content: string
  updatedAt: string
}

export type LegalPageInput = Pick<LegalPage, 'type' | 'title' | 'content'>
