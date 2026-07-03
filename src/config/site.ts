// Central place for brand, contact, and business copy.
// Nothing in components/pages should hardcode phone numbers, brand name,
// or address directly — they should import from here. That way a rebrand
// or contact-detail change is a one-file edit instead of a grep-and-replace.

export const siteConfig = {
  name: 'Parth Saarthi Travels',
  shortName: 'Parth Saarthi',
  tagline: 'आपकी सेवा, हमारा सौभाग्य',
  taglineEn: 'Your service, our privilege',
  description:
    'Spiritual yatras to Khatu Shyam Ji, Vrindavan & Haridwar plus holiday trips to Manali, Mussoorie, Rishikesh & Dehradun. 1000+ happy travellers.',
  founder: 'YOGESH THAKUR',
  emoji: '🙏',

  contact: {
    phones: ['9773834051', '8864910917'],
    primaryPhone: '9773834051',
    whatsapp: '919773834051',
    whatsappUrl: 'https://wa.me/919773834051',
    email: 'admin@vedica.com',
    availability: 'Available: 9 AM – 9 PM daily',
  },

  address: {
    line1: 'Sector 52, Noida',
    line2: 'Metro Pillar No. 657',
    pickupLabel: 'Sector 52, Noida – Metro Pillar No. 657',
  },

  stats: {
    happyTravellers: '1000+',
    tripsCompleted: '50+',
    destinations: '15+',
    averageRating: '4.9★',
  },

  social: {
    // Reserved for future use (Instagram/Facebook links etc.) — add here,
    // not inline in components, when those are available.
  },
} as const

export function phoneHref(phone: string) {
  return `tel:${phone}`
}
