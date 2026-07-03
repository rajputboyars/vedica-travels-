// Demo-mode singleton store for SiteSettings. Seeded from the values that
// used to be hardcoded in config/site.ts, so switching this app into demo
// mode (no MONGODB_URI) looks identical to before Phase 10 until an admin
// actually edits something in the CMS.
import type { SiteSettings } from '@/types'

type Store = { settings: SiteSettings }

const g = global as unknown as { __demoSiteSettingsStore?: Store }

if (!g.__demoSiteSettingsStore) {
  g.__demoSiteSettingsStore = {
    settings: {
      _id: 'demo-site-settings',
      siteName: 'Parth Saarthi Travels',
      shortName: 'Parth Saarthi',
      tagline: 'आपकी सेवा, हमारा सौभाग्य',
      taglineEn: 'Your service, our privilege',
      description:
        'Spiritual yatras to Khatu Shyam Ji, Vrindavan & Haridwar plus holiday trips to Manali, Mussoorie, Rishikesh & Dehradun. 1000+ happy travellers.',
      founder: 'YOGESH THAKUR',
      contact: {
        phones: ['9773834051', '8864910917'],
        primaryPhone: '9773834051',
        whatsapp: '919773834051',
        email: 'admin@vedica.com',
        availability: 'Available: 9 AM – 9 PM daily',
      },
      address: {
        line1: 'Sector 52, Noida',
        line2: 'Metro Pillar No. 657',
        pickupLabel: 'Sector 52, Noida – Metro Pillar No. 657',
      },
      social: {},
      stats: {
        happyTravellers: '1000+',
        tripsCompleted: '50+',
        destinations: '15+',
        averageRating: '4.9★',
      },
      updatedAt: new Date().toISOString(),
    },
  }
}

const store = g.__demoSiteSettingsStore

export function getSettings(): SiteSettings {
  return store.settings
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  store.settings = { ...store.settings, ...data, updatedAt: new Date().toISOString() }
  return store.settings
}
