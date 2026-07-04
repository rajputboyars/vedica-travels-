// Shared display metadata for the two trip categories. Defined once so
// the homepage, tours listing, tour detail, and admin form all agree on
// label/emoji/color instead of re-declaring the same ternary everywhere.

export type TourCategory = 'spiritual' | 'leisure'

export const categoryMeta: Record<TourCategory, {
  label: string
  emoji: string
  badgeClass: string
  gradientClass: string
}> = {
  spiritual: {
    label: 'Spiritual Yatra',
    emoji: '🛕',
    badgeClass: 'bg-orange-600',
    gradientClass: 'from-orange-400 to-amber-500',
  },
  leisure: {
    label: 'Holiday Trip',
    emoji: '🏔️',
    badgeClass: 'bg-emerald-600',
    gradientClass: 'from-sky-400 to-emerald-500',
  },
}

export function resolveCategory(category?: string): TourCategory {
  return category === 'leisure' ? 'leisure' : 'spiritual'
}
