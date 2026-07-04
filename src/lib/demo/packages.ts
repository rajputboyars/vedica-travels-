// In-memory package store used when MONGODB_URI is not configured — same
// global-cached-singleton pattern as demo/bookings.ts, but (unlike
// demo/tours.ts) supports full create/update/delete so the whole Package
// Management module is exercisable without a database.
import type { Package } from '@/types'
import { slugify } from '@/lib/slugify'

type Store = { packages: Package[]; seeded: boolean }

const g = global as unknown as { __demoPackageStore?: Store }

if (!g.__demoPackageStore) {
  g.__demoPackageStore = { packages: [], seeded: false }
}

const store = g.__demoPackageStore

const img = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`

const DEMO_QR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><rect width="220" height="220" fill="white"/><rect x="10" y="10" width="60" height="60" fill="black"/><rect x="25" y="25" width="30" height="30" fill="white"/><rect x="150" y="10" width="60" height="60" fill="black"/><rect x="165" y="25" width="30" height="30" fill="white"/><rect x="10" y="150" width="60" height="60" fill="black"/><rect x="25" y="165" width="30" height="30" fill="white"/><rect x="90" y="40" width="15" height="15" fill="black"/><rect x="120" y="40" width="15" height="15" fill="black"/><rect x="90" y="90" width="15" height="15" fill="black"/><rect x="120" y="90" width="15" height="15" fill="black"/><rect x="150" y="120" width="15" height="15" fill="black"/><rect x="90" y="150" width="15" height="15" fill="black"/><rect x="120" y="180" width="15" height="15" fill="black"/><rect x="180" y="150" width="15" height="15" fill="black"/></svg>'

function seed() {
  if (store.seeded) return
  store.seeded = true
  store.packages = [
    {
      _id: 'demo-package-1',
      title: 'Char Dham Yatra',
      slug: 'char-dham-yatra',
      category: 'pilgrimage',
      status: 'published',
      isArchived: false,
      description:
        'A complete pilgrimage covering Yamunotri, Gangotri, Kedarnath and Badrinath — the holiest Himalayan shrines.',
      shortDescription: 'The four holiest Himalayan shrines in one sacred journey.',
      price: 18500,
      duration: { days: 9, nights: 8 },
      totalSeats: 40,
      images: [img('photo-1600100397608-59e4c548e79c'), img('photo-1602216056096-3b40cc0c9944')],
      gallery: [img('photo-1602216056096-3b40cc0c9944')],
      itinerary: [
        { day: 1, title: 'Departure', description: 'Depart from Haridwar towards Yamunotri.' },
        { day: 2, title: 'Yamunotri Darshan', description: 'Trek and darshan at Yamunotri temple.' },
        { day: 3, title: 'Gangotri Darshan', description: 'Travel to Gangotri and evening aarti.' },
      ],
      pickupPoints: ['Haridwar Railway Station (06:00 AM)', 'Rishikesh Bus Stand (07:00 AM)'],
      includedServices: ['AC Bus/Tempo Traveller', 'Hotel stay', 'Breakfast & Dinner', 'Guide'],
      excludedServices: ['Lunch', 'Pony/Helicopter charges', 'Personal expenses'],
      faqs: [
        { question: 'Is this suitable for elderly travellers?', answer: 'Yes, palanquin/pony assistance can be arranged at an extra cost.' },
        { question: 'What is the best time to travel?', answer: 'May to June and September to October.' },
      ],
      featured: true,
      metaTitle: 'Char Dham Yatra Package | Parth Saarthi Travels',
      metaDescription: 'Book the Char Dham Yatra — Yamunotri, Gangotri, Kedarnath, Badrinath — with AC transport, stay and guide.',
      paymentNote: 'Scan the QR, pay the full package amount per person, then submit your transaction ID and screenshot on the next step.',
      qrImages: [DEMO_QR],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: 'demo-package-2',
      title: 'Goa Family Holiday',
      slug: 'goa-family-holiday',
      category: 'family',
      status: 'draft',
      isArchived: false,
      description: 'A relaxed family holiday with beaches, water sports and comfortable resort stay in North Goa.',
      shortDescription: 'Beaches, resorts, and fun for the whole family.',
      price: 24999,
      duration: { days: 4, nights: 3 },
      totalSeats: 30,
      images: [img('photo-1512343879784-a960bf40e7f2')],
      gallery: [],
      itinerary: [
        { day: 1, title: 'Arrival', description: 'Arrival and check-in, evening at leisure on the beach.' },
        { day: 2, title: 'North Goa Sightseeing', description: 'Fort Aguada, Baga Beach, Calangute.' },
      ],
      pickupPoints: ['Goa Airport'],
      includedServices: ['Resort stay', 'Breakfast', 'Airport transfers', 'Sightseeing cab'],
      excludedServices: ['Flights', 'Water sports tickets', 'Lunch/Dinner'],
      faqs: [],
      featured: false,
      qrImages: [],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      _id: 'demo-package-3',
      title: 'Corporate Offsite – Rishikesh',
      slug: 'corporate-offsite-rishikesh',
      category: 'corporate',
      status: 'hidden',
      isArchived: false,
      description: 'Team-building offsite with river rafting, bonfire nights and adventure activities near the Ganges.',
      shortDescription: 'Adventure-driven corporate offsite by the Ganges.',
      price: 6999,
      duration: { days: 2, nights: 1 },
      totalSeats: 60,
      images: [],
      gallery: [],
      itinerary: [
        { day: 1, title: 'Arrival & Rafting', description: 'River rafting followed by bonfire and team games.' },
        { day: 2, title: 'Adventure Activities', description: 'Bungee/zipline (optional add-on) and departure.' },
      ],
      pickupPoints: ['Delhi ISBT (06:00 AM)'],
      includedServices: ['Camping stay', 'All meals', 'Rafting', 'Team-building facilitator'],
      excludedServices: ['Bungee jumping', 'Personal expenses'],
      faqs: [{ question: 'Can this be customized for group size?', answer: 'Yes, contact us for custom group pricing.' }],
      featured: false,
      qrImages: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]
}

// Re-exported from the shared lib/slugify.ts (see that file's comment) —
// kept here too so existing `demo.slugify(...)` call sites in
// package.service.ts don't need to change.
export { slugify }

export function getPackages(): Package[] {
  seed()
  return store.packages
}

export function getPackage(id: string): Package | undefined {
  return getPackages().find((p) => p._id === id)
}

export function getPackageBySlug(slug: string): Package | undefined {
  return getPackages().find((p) => p.slug === slug)
}

export function slugExists(slug: string, excludeId?: string): boolean {
  return getPackages().some((p) => p.slug === slug && p._id !== excludeId)
}

export function addPackage(data: Partial<Package>): Package {
  seed()
  const now = new Date().toISOString()
  const pkg: Package = {
    _id: 'pkg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: data.title || 'Untitled Package',
    slug: data.slug || slugify(data.title || 'untitled-package'),
    category: data.category || 'spiritual',
    status: data.status || 'draft',
    isArchived: data.isArchived ?? false,
    description: data.description || '',
    shortDescription: data.shortDescription,
    price: data.price || 0,
    duration: data.duration || { days: 1, nights: 0 },
    totalSeats: data.totalSeats ?? 50,
    images: data.images || [],
    gallery: data.gallery || [],
    itinerary: data.itinerary || [],
    pickupPoints: data.pickupPoints || [],
    includedServices: data.includedServices || [],
    excludedServices: data.excludedServices || [],
    faqs: data.faqs || [],
    featured: data.featured ?? false,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    paymentNote: data.paymentNote,
    qrImages: data.qrImages || [],
    createdAt: now,
    updatedAt: now,
  }
  store.packages.unshift(pkg)
  return pkg
}

export function updatePackage(id: string, data: Partial<Package>): Package | undefined {
  const p = getPackage(id)
  if (!p) return undefined
  Object.assign(p, data, { updatedAt: new Date().toISOString() })
  return p
}

export function deletePackage(id: string): boolean {
  seed()
  const idx = store.packages.findIndex((p) => p._id === id)
  if (idx === -1) return false
  store.packages.splice(idx, 1)
  return true
}
