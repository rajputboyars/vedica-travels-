// Demo-mode singleton store for HomepageContent. Seeded from the copy
// that used to be hardcoded directly in
// src/app/(public)/page.tsx (hero text, category tiles, "Why Travel With
// Us" cards, CTA section) so the homepage renders identically in demo
// mode until an admin edits it via the CMS.
import type { HomepageContent } from '@/types'

type Store = { content: HomepageContent }

const g = global as unknown as { __demoHomepageStore?: Store }

if (!g.__demoHomepageStore) {
  g.__demoHomepageStore = {
    content: {
      _id: 'demo-homepage',
      hero: {
        badgeText: '🙏 जय श्री श्याम | 1000+ happy travellers',
        title: 'Parth Saarthi Travels',
        subtitle: 'आपकी सेवा, हमारा सौभाग्य',
        description:
          'Sacred yatras to Khatu Shyam Ji, Vrindavan & Haridwar — plus holiday trips to Manali, Mussoorie, Rishikesh & Dehradun.',
        backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop',
        primaryCtaLabel: 'Explore All Trips',
        primaryCtaHref: '/tours',
        secondaryCtaLabel: 'WhatsApp Us',
        secondaryCtaHref: '',
      },
      categoryTiles: [
        {
          title: 'Spiritual Yatras',
          subtitle: 'Khatu Shyam, Vrindavan, Haridwar & more',
          image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80&auto=format&fit=crop',
          href: '/tours?cat=spiritual',
        },
        {
          title: 'Holiday Trips',
          subtitle: 'Manali, Mussoorie, Rishikesh, Dehradun',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80&auto=format&fit=crop',
          href: '/tours?cat=leisure',
        },
      ],
      whyTravelWithUs: [
        { title: 'AC Bus & Volvo', description: 'Comfortable coaches for every journey' },
        { title: 'Meals Included', description: 'Breakfast & meals on all trips' },
        { title: 'Refreshments', description: 'Water bottles & snacks provided' },
        { title: 'Guided Tours', description: 'Experienced guides throughout' },
      ],
      ctaTitle: 'Ready for Your Next Journey?',
      ctaSubtitle: 'Contact us today to book your seat. Limited seats available!',
      updatedAt: new Date().toISOString(),
    },
  }
}

const store = g.__demoHomepageStore

export function getContent(): HomepageContent {
  return store.content
}

export function updateContent(data: Partial<HomepageContent>): HomepageContent {
  store.content = { ...store.content, ...data, updatedAt: new Date().toISOString() }
  return store.content
}
