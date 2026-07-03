import type { Testimonial } from '@/types'

type Store = { testimonials: Testimonial[]; seeded: boolean }

const g = global as unknown as { __demoTestimonialsStore?: Store }

if (!g.__demoTestimonialsStore) {
  g.__demoTestimonialsStore = { testimonials: [], seeded: false }
}

const store = g.__demoTestimonialsStore

function seed() {
  if (store.seeded) return
  store.seeded = true
  const now = new Date().toISOString()
  store.testimonials = [
    {
      _id: 'demo-testimonial-1',
      name: 'Suresh Sharma',
      location: 'Noida',
      rating: 5,
      message: 'Beautifully organized Khatu Shyam Ji yatra — comfortable bus, great food, and the guide was very caring throughout.',
      published: true,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'demo-testimonial-2',
      name: 'Priya Verma',
      location: 'Ghaziabad',
      rating: 5,
      message: 'Our Manali family trip was perfectly planned. Everything from pickup to hotel was smooth. Highly recommend Parth Saarthi Travels!',
      published: true,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function getTestimonials(): Testimonial[] {
  seed()
  return store.testimonials
}

export function getTestimonial(id: string): Testimonial | undefined {
  return getTestimonials().find((t) => t._id === id)
}

export function addTestimonial(data: Partial<Testimonial>): Testimonial {
  seed()
  const now = new Date().toISOString()
  const testimonial: Testimonial = {
    _id: 't-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    name: data.name || '',
    location: data.location,
    rating: data.rating ?? 5,
    message: data.message || '',
    avatar: data.avatar,
    published: data.published ?? true,
    order: data.order ?? 0,
    createdAt: now,
    updatedAt: now,
  }
  store.testimonials.unshift(testimonial)
  return testimonial
}

export function updateTestimonial(id: string, data: Partial<Testimonial>): Testimonial | undefined {
  const t = getTestimonial(id)
  if (!t) return undefined
  Object.assign(t, data, { updatedAt: new Date().toISOString() })
  return t
}

export function deleteTestimonial(id: string): boolean {
  seed()
  const idx = store.testimonials.findIndex((t) => t._id === id)
  if (idx === -1) return false
  store.testimonials.splice(idx, 1)
  return true
}
