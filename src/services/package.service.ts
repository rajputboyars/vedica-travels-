import { isDBConfigured } from '@/config/env'
import * as demo from '@/lib/demo/packages'
import type { Package, PackageInput, PackageCategory, PackageStatus } from '@/types'
import { serialize } from './serialize'

// Every read/write to package data goes through this module — route
// handlers and server components never import the Package model or the
// demo store directly, so demo mode and DB mode behave identically (the
// same "one door in" rule tour.service.ts/booking.service.ts follow).
// This also means a future booking system can depend on this service's
// exported functions/types without needing to know whether the data came
// from MongoDB or the in-memory demo store.
async function db() {
  const [{ default: connectDB }, { default: Package }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Package'),
  ])
  await connectDB()
  return Package
}

export interface PackageFilters {
  category?: PackageCategory
  status?: PackageStatus
  // Listing endpoints default to hiding archived packages (they're
  // "taken out of rotation"); pass includeArchived to see them anyway
  // (e.g. the admin list view's "Archived" tab).
  includeArchived?: boolean
}

function matchesFilters(pkg: Package, filters: PackageFilters): boolean {
  if (filters.category && pkg.category !== filters.category) return false
  if (filters.status && pkg.status !== filters.status) return false
  if (!filters.includeArchived && pkg.isArchived) return false
  return true
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || 'package'
  let n = 2
  if (!isDBConfigured) {
    while (demo.slugExists(slug, excludeId)) {
      slug = `${base}-${n++}`
    }
    return slug
  }
  const Package = await db()
  while (true) {
    const existing = await Package.findOne({ slug }).select('_id')
    if (!existing || existing._id.toString() === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function listPackages(filters: PackageFilters = {}): Promise<Package[]> {
  if (!isDBConfigured) return demo.getPackages().filter((p) => matchesFilters(p, filters))
  try {
    const Package = await db()
    const query: Record<string, unknown> = {}
    if (filters.category) query.category = filters.category
    if (filters.status) query.status = filters.status
    if (!filters.includeArchived) query.isArchived = { $ne: true }
    const packages = await Package.find(query).sort({ createdAt: -1 })
    return serialize(packages)
  } catch {
    return demo.getPackages().filter((p) => matchesFilters(p, filters))
  }
}

export async function getPackage(id: string): Promise<Package | null> {
  if (!isDBConfigured) return demo.getPackage(id) ?? null
  try {
    const Package = await db()
    const pkg = await Package.findById(id)
    return pkg ? serialize(pkg) : null
  } catch {
    return null
  }
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  if (!isDBConfigured) return demo.getPackageBySlug(slug) ?? null
  try {
    const Package = await db()
    const pkg = await Package.findOne({ slug })
    return pkg ? serialize(pkg) : null
  } catch {
    return null
  }
}

export async function createPackage(data: PackageInput): Promise<Package> {
  const base = demo.slugify(data.slug || data.title)
  const slug = await ensureUniqueSlug(base)
  const payload = { ...data, slug }

  if (!isDBConfigured) return demo.addPackage(payload)
  const Package = await db()
  const pkg = await Package.create(payload)
  return serialize(pkg)
}

// Slug is only regenerated when the caller explicitly sends a new `slug`
// (re-checked for uniqueness); editing `title` alone never silently
// changes the live URL — this keeps published package links/SEO stable.
export async function updatePackage(id: string, data: Partial<PackageInput>): Promise<Package | null> {
  const payload: Partial<PackageInput> = { ...data }
  if (data.slug) {
    payload.slug = await ensureUniqueSlug(demo.slugify(data.slug), id)
  }

  if (!isDBConfigured) return demo.updatePackage(id, payload) ?? null
  const Package = await db()
  const pkg = await Package.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
  return pkg ? serialize(pkg) : null
}

export async function setPackageStatus(id: string, status: PackageStatus): Promise<Package | null> {
  return updatePackage(id, { status })
}

export async function setPackageArchived(id: string, isArchived: boolean): Promise<Package | null> {
  if (!isDBConfigured) return demo.updatePackage(id, { isArchived }) ?? null
  const Package = await db()
  const pkg = await Package.findByIdAndUpdate(id, { isArchived }, { new: true })
  return pkg ? serialize(pkg) : null
}

export async function deletePackage(id: string): Promise<boolean> {
  if (!isDBConfigured) return demo.deletePackage(id)
  const Package = await db()
  await Package.findByIdAndDelete(id)
  return true
}
