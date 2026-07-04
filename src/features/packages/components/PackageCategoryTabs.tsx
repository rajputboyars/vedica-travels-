'use client'
import { packageCategoryOrder, packageCategoryMeta } from '@/config/package-theme'
import type { PackageCategory } from '@/types'

export type PackageCategoryFilter = 'all' | PackageCategory

export default function PackageCategoryTabs({ value, onChange }: { value: PackageCategoryFilter; onChange: (v: PackageCategoryFilter) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      <button
        onClick={() => onChange('all')}
        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
          value === 'all' ? 'bg-gilt-400 text-ink-900' : 'glass gilt-border text-white/70 hover:bg-white/5'
        }`}
      >
        All Packages
      </button>
      {packageCategoryOrder.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            value === c ? 'bg-gilt-400 text-ink-900' : 'glass gilt-border text-white/70 hover:bg-white/5'
          }`}
        >
          {packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}
        </button>
      ))}
    </div>
  )
}
