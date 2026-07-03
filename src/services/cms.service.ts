// Phase 10 — Admin CMS. One service file for all six CMS entities
// (SiteSettings, HomepageContent, Testimonial, Blog, FAQItem, LegalPage)
// rather than six near-identical files — they're small, share the same
// isDBConfigured demo-fallback pattern as every other service in this
// codebase, and grouping them here matches how the admin CMS nav groups
// them under one "Content" section. Each entity still gets its own model,
// demo store, and API route — only the service layer is consolidated.
import { isDBConfigured } from '@/config/env'
import * as demoSettings from '@/lib/demo/site-settings'
import * as demoHomepage from '@/lib/demo/homepage'
import * as demoTestimonials from '@/lib/demo/testimonials'
import * as demoBlogs from '@/lib/demo/blogs'
import * as demoFaqs from '@/lib/demo/faqs'
import * as demoLegal from '@/lib/demo/legal-pages'
import { slugify } from '@/lib/slugify'
import { serialize } from './serialize'
import type {
  SiteSettings,
  SiteSettingsInput,
  HomepageContent,
  HomepageContentInput,
  Testimonial,
  TestimonialInput,
  Blog,
  BlogInput,
  FAQItem,
  FAQItemInput,
  LegalPage,
  LegalPageInput,
  LegalPageType,
} from '@/types'

async function models() {
  const [{ default: connectDB }, models] = await Promise.all([import('@/lib/db'), import('@/models')])
  await connectDB()
  return { connectDB, ...models }
}

// ---- Site Settings (singleton) -----------------------------------------
// Guarantees every field a consumer (public layout JSON-LD, Navbar,
// Footer, admin CMS form) dereferences without an optional chain always
// exists, even for documents written before a field existed or -- before
// the model's `minimize: false` fix -- saved with an empty `social: {}`
// that Mongoose then stripped from the stored document entirely. This is
// the one place that normalizes, so every caller gets a safe shape for
// free instead of scattering `settings.social || {}` guards everywhere.
function normalizeSettings(settings: SiteSettings): SiteSettings {
  return { ...settings, social: settings.social || {} }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isDBConfigured) return normalizeSettings(demoSettings.getSettings())
  try {
    const { SiteSettings: Model } = await models()
    let doc = await Model.findOne({})
    if (!doc) {
      // First-run seed: create the one document from the same defaults
      // the demo store uses, so a fresh DB behaves identically to demo
      // mode until an admin edits something.
      const { _id, updatedAt, ...seedFields } = demoSettings.getSettings()
      void _id
      void updatedAt
      doc = await Model.create(seedFields)
    }
    return normalizeSettings(serialize(doc))
  } catch {
    return normalizeSettings(demoSettings.getSettings())
  }
}

export async function updateSiteSettings(data: Partial<SiteSettingsInput>): Promise<SiteSettings> {
  if (!isDBConfigured) return normalizeSettings(demoSettings.updateSettings(data))
  const { SiteSettings: Model } = await models()
  let doc = await Model.findOne({})
  if (!doc) doc = await Model.create(data)
  else doc = await Model.findByIdAndUpdate(doc._id, data, { new: true, runValidators: true })
  return normalizeSettings(serialize(doc!))
}

// ---- Homepage Content (singleton) --------------------------------------
export async function getHomepageContent(): Promise<HomepageContent> {
  if (!isDBConfigured) return demoHomepage.getContent()
  try {
    const { HomepageContent: Model } = await models()
    let doc = await Model.findOne({})
    if (!doc) {
      const { _id, updatedAt, ...seedFields } = demoHomepage.getContent()
      void _id
      void updatedAt
      doc = await Model.create(seedFields)
    }
    return serialize(doc)
  } catch {
    return demoHomepage.getContent()
  }
}

export async function updateHomepageContent(data: Partial<HomepageContentInput>): Promise<HomepageContent> {
  if (!isDBConfigured) return demoHomepage.updateContent(data)
  const { HomepageContent: Model } = await models()
  let doc = await Model.findOne({})
  if (!doc) doc = await Model.create(data)
  else doc = await Model.findByIdAndUpdate(doc._id, data, { new: true, runValidators: true })
  return serialize(doc!)
}

// ---- Testimonials (collection) -----------------------------------------
export interface TestimonialFilters {
  publishedOnly?: boolean
}

export async function listTestimonials(filters: TestimonialFilters = {}): Promise<Testimonial[]> {
  if (!isDBConfigured) {
    const all = demoTestimonials.getTestimonials()
    return filters.publishedOnly ? all.filter((t) => t.published) : all
  }
  try {
    const { Testimonial: Model } = await models()
    const query: Record<string, unknown> = {}
    if (filters.publishedOnly) query.published = true
    const docs = await Model.find(query).sort({ order: 1, createdAt: -1 })
    return serialize(docs)
  } catch {
    const all = demoTestimonials.getTestimonials()
    return filters.publishedOnly ? all.filter((t) => t.published) : all
  }
}

export async function createTestimonial(data: TestimonialInput): Promise<Testimonial> {
  if (!isDBConfigured) return demoTestimonials.addTestimonial(data)
  const { Testimonial: Model } = await models()
  const doc = await Model.create(data)
  return serialize(doc)
}

export async function updateTestimonial(id: string, data: Partial<TestimonialInput>): Promise<Testimonial | null> {
  if (!isDBConfigured) return demoTestimonials.updateTestimonial(id, data) ?? null
  const { Testimonial: Model } = await models()
  const doc = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  return doc ? serialize(doc) : null
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  if (!isDBConfigured) return demoTestimonials.deleteTestimonial(id)
  const { Testimonial: Model } = await models()
  await Model.findByIdAndDelete(id)
  return true
}

// ---- Blogs (collection) --------------------------------------------------
export interface BlogFilters {
  status?: 'draft' | 'published'
  tag?: string
}

function matchesBlogFilters(b: Blog, filters: BlogFilters): boolean {
  if (filters.status && b.status !== filters.status) return false
  if (filters.tag && !b.tags.includes(filters.tag)) return false
  return true
}

async function ensureUniqueBlogSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || 'post'
  let n = 2
  if (!isDBConfigured) {
    while (demoBlogs.getBlogs().some((b) => b.slug === slug && b._id !== excludeId)) {
      slug = `${base}-${n++}`
    }
    return slug
  }
  const { Blog: Model } = await models()
  while (true) {
    const existing = await Model.findOne({ slug }).select('_id')
    if (!existing || existing._id.toString() === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function listBlogs(filters: BlogFilters = {}): Promise<Blog[]> {
  if (!isDBConfigured) return demoBlogs.getBlogs().filter((b) => matchesBlogFilters(b, filters))
  try {
    const { Blog: Model } = await models()
    const query: Record<string, unknown> = {}
    if (filters.status) query.status = filters.status
    if (filters.tag) query.tags = filters.tag
    const docs = await Model.find(query).sort({ createdAt: -1 })
    return serialize(docs)
  } catch {
    return demoBlogs.getBlogs().filter((b) => matchesBlogFilters(b, filters))
  }
}

export async function getBlog(id: string): Promise<Blog | null> {
  if (!isDBConfigured) return demoBlogs.getBlog(id) ?? null
  try {
    const { Blog: Model } = await models()
    const doc = await Model.findById(id)
    return doc ? serialize(doc) : null
  } catch {
    return null
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (!isDBConfigured) return demoBlogs.getBlogBySlug(slug) ?? null
  try {
    const { Blog: Model } = await models()
    const doc = await Model.findOne({ slug })
    return doc ? serialize(doc) : null
  } catch {
    return null
  }
}

export async function createBlog(data: BlogInput): Promise<Blog> {
  const base = slugify(data.slug || data.title)
  const slug = await ensureUniqueBlogSlug(base)
  const publishedAt = data.status === 'published' ? new Date().toISOString() : undefined
  const payload = { ...data, slug, publishedAt }

  if (!isDBConfigured) return demoBlogs.addBlog(payload)
  const { Blog: Model } = await models()
  const doc = await Model.create(payload)
  return serialize(doc)
}

export async function updateBlog(id: string, data: Partial<BlogInput>): Promise<Blog | null> {
  const payload: Partial<BlogInput> & { publishedAt?: string } = { ...data }
  if (data.slug) payload.slug = await ensureUniqueBlogSlug(slugify(data.slug), id)

  if (!isDBConfigured) return demoBlogs.updateBlog(id, payload) ?? null

  // publishedAt is set the first time status flips to 'published', not
  // overwritten on every subsequent edit — mirrors demo/blogs.ts.
  if (data.status === 'published') {
    const existing = await getBlog(id)
    if (existing && existing.status !== 'published' && !existing.publishedAt) {
      payload.publishedAt = new Date().toISOString()
    }
  }

  const { Blog: Model } = await models()
  const doc = await Model.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
  return doc ? serialize(doc) : null
}

export async function deleteBlog(id: string): Promise<boolean> {
  if (!isDBConfigured) return demoBlogs.deleteBlog(id)
  const { Blog: Model } = await models()
  await Model.findByIdAndDelete(id)
  return true
}

// ---- FAQs (collection) ----------------------------------------------------
export interface FAQFilters {
  publishedOnly?: boolean
  category?: string
}

function matchesFaqFilters(f: FAQItem, filters: FAQFilters): boolean {
  if (filters.publishedOnly && !f.published) return false
  if (filters.category && f.category !== filters.category) return false
  return true
}

export async function listFAQs(filters: FAQFilters = {}): Promise<FAQItem[]> {
  if (!isDBConfigured) return demoFaqs.getFAQs().filter((f) => matchesFaqFilters(f, filters))
  try {
    const { FAQItem: Model } = await models()
    const query: Record<string, unknown> = {}
    if (filters.publishedOnly) query.published = true
    if (filters.category) query.category = filters.category
    const docs = await Model.find(query).sort({ order: 1, createdAt: 1 })
    return serialize(docs)
  } catch {
    return demoFaqs.getFAQs().filter((f) => matchesFaqFilters(f, filters))
  }
}

export async function createFAQ(data: FAQItemInput): Promise<FAQItem> {
  if (!isDBConfigured) return demoFaqs.addFAQ(data)
  const { FAQItem: Model } = await models()
  const doc = await Model.create(data)
  return serialize(doc)
}

export async function updateFAQ(id: string, data: Partial<FAQItemInput>): Promise<FAQItem | null> {
  if (!isDBConfigured) return demoFaqs.updateFAQ(id, data) ?? null
  const { FAQItem: Model } = await models()
  const doc = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  return doc ? serialize(doc) : null
}

export async function deleteFAQ(id: string): Promise<boolean> {
  if (!isDBConfigured) return demoFaqs.deleteFAQ(id)
  const { FAQItem: Model } = await models()
  await Model.findByIdAndDelete(id)
  return true
}

// ---- Legal Pages (Terms / Privacy / Refund) ------------------------------
export async function getLegalPage(type: LegalPageType): Promise<LegalPage> {
  if (!isDBConfigured) return demoLegal.getLegalPage(type)
  try {
    const { LegalPage: Model } = await models()
    let doc = await Model.findOne({ type })
    if (!doc) {
      const seed = demoLegal.getLegalPage(type)
      doc = await Model.create({ type, title: seed.title, content: seed.content })
    }
    return serialize(doc)
  } catch {
    return demoLegal.getLegalPage(type)
  }
}

export async function getAllLegalPages(): Promise<LegalPage[]> {
  if (!isDBConfigured) return demoLegal.getAllLegalPages()
  const types: LegalPageType[] = ['terms', 'privacy', 'refund']
  return Promise.all(types.map((t) => getLegalPage(t)))
}

export async function upsertLegalPage(type: LegalPageType, data: Omit<LegalPageInput, 'type'>): Promise<LegalPage> {
  if (!isDBConfigured) return demoLegal.upsertLegalPage(type, data)
  const { LegalPage: Model } = await models()
  const doc = await Model.findOneAndUpdate({ type }, { ...data, type }, { new: true, upsert: true, runValidators: true })
  return serialize(doc)
}
