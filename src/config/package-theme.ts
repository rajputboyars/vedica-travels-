// Display metadata for the six Package categories — kept separate from
// config/theme.ts's categoryMeta (which only covers Tour's two
// categories: spiritual/leisure). Defined once so the admin package
// list/form and any future public package pages agree on label/emoji/
// color instead of re-declaring the same switch statement everywhere.
import type { PackageCategory } from '@/types'

export const packageCategoryMeta: Record<PackageCategory, {
  label: string
  emoji: string
  badgeClass: string
}> = {
  spiritual: { label: 'Spiritual', emoji: '🛕', badgeClass: 'bg-orange-100 text-orange-700' },
  pilgrimage: { label: 'Pilgrimage', emoji: '🙏', badgeClass: 'bg-amber-100 text-amber-700' },
  holiday: { label: 'Holiday', emoji: '🏖️', badgeClass: 'bg-emerald-100 text-emerald-700' },
  weekend: { label: 'Weekend Getaway', emoji: '🏕️', badgeClass: 'bg-sky-100 text-sky-700' },
  family: { label: 'Family', emoji: '👨‍👩‍👧‍👦', badgeClass: 'bg-pink-100 text-pink-700' },
  corporate: { label: 'Corporate', emoji: '💼', badgeClass: 'bg-slate-100 text-slate-700' },
}

export const packageCategoryOrder: PackageCategory[] = [
  'spiritual',
  'pilgrimage',
  'holiday',
  'weekend',
  'family',
  'corporate',
]

export function resolvePackageCategory(category?: string): PackageCategory {
  return (packageCategoryOrder as string[]).includes(category ?? '')
    ? (category as PackageCategory)
    : 'spiritual'
}

export const packageStatusMeta: Record<'draft' | 'published' | 'hidden', { label: string; badgeClass: string }> = {
  draft: { label: 'Draft', badgeClass: 'bg-gray-100 text-gray-600' },
  published: { label: 'Published', badgeClass: 'bg-green-100 text-green-700' },
  hidden: { label: 'Hidden', badgeClass: 'bg-yellow-100 text-yellow-700' },
}
