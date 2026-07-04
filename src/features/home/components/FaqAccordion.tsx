'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { FAQItem } from '@/types'

// Animated glass accordion for the homepage FAQ section. Single-open
// behaviour; height animates via grid-template-rows (0fr → 1fr) which is
// GPU-cheap and needs no measurement.
export default function FaqAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={item._id}
            className={`glass gilt-border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'bg-white/[0.06]' : ''}`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white/90">{item.question}</span>
              <span
                className={`grid place-items-center w-8 h-8 shrink-0 rounded-full border border-gilt-500/40 text-gilt-300 transition-transform duration-500 ${isOpen ? 'rotate-45 bg-gilt-500/15' : ''}`}
              >
                <Plus size={16} />
              </span>
            </button>
            <div className={`grid transition-all duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-sm leading-relaxed text-white/60">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
