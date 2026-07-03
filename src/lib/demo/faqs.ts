import type { FAQItem } from '@/types'

type Store = { faqs: FAQItem[]; seeded: boolean }

const g = global as unknown as { __demoFAQStore?: Store }

if (!g.__demoFAQStore) {
  g.__demoFAQStore = { faqs: [], seeded: false }
}

const store = g.__demoFAQStore

function seed() {
  if (store.seeded) return
  store.seeded = true
  const now = new Date().toISOString()
  store.faqs = [
    {
      _id: 'demo-faq-1',
      question: 'How do I book a package?',
      answer: 'Open any package page and click "Register Now". Fill in your details, and you\'ll get payment instructions right after.',
      category: 'Booking',
      order: 1,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'demo-faq-2',
      question: 'What payment methods do you accept?',
      answer: "We currently accept manual UPI/QR payments — scan the QR shown after registering and upload your payment screenshot for verification.",
      category: 'Payments',
      order: 2,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function getFAQs(): FAQItem[] {
  seed()
  return store.faqs
}

export function getFAQ(id: string): FAQItem | undefined {
  return getFAQs().find((f) => f._id === id)
}

export function addFAQ(data: Partial<FAQItem>): FAQItem {
  seed()
  const now = new Date().toISOString()
  const faq: FAQItem = {
    _id: 'faq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    question: data.question || '',
    answer: data.answer || '',
    category: data.category,
    order: data.order ?? 0,
    published: data.published ?? true,
    createdAt: now,
    updatedAt: now,
  }
  store.faqs.unshift(faq)
  return faq
}

export function updateFAQ(id: string, data: Partial<FAQItem>): FAQItem | undefined {
  const f = getFAQ(id)
  if (!f) return undefined
  Object.assign(f, data, { updatedAt: new Date().toISOString() })
  return f
}

export function deleteFAQ(id: string): boolean {
  seed()
  const idx = store.faqs.findIndex((f) => f._id === id)
  if (idx === -1) return false
  store.faqs.splice(idx, 1)
  return true
}
