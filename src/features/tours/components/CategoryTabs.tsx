'use client'

export type CategoryFilter = 'all' | 'spiritual' | 'leisure'

const tabs: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All Trips' },
  { key: 'spiritual', label: '🛕 Spiritual Yatras' },
  { key: 'leisure', label: '🏔️ Holiday Trips' },
]

export default function CategoryTabs({ value, onChange }: { value: CategoryFilter; onChange: (v: CategoryFilter) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            value === t.key ? 'bg-orange-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
