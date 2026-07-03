'use client'
import { packageCategoryOrder, packageCategoryMeta } from '@/config/package-theme'
import type { PackageCategory } from '@/types'

export type PackageCategoryFilter = 'all' | PackageCategory

export default function PackageCategoryTabs({ value, onChange }: { value: PackageCategoryFilter; onChange: (v: PackageCategoryFilter) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      <button
        onClick={() => onChange('all')}
        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
          value === 'all' ? 'bg-orange-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
        }`}
      >
        All Packages
      </button>
      {packageCategoryOrder.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            value === c ? 'bg-orange-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
          }`}
        >
          {packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}
        </button>
      ))}
    </div>
  )
}
