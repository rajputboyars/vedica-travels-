'use client'
import { useState } from 'react'
import { Search, Phone, Mail, BookOpen, UserX } from 'lucide-react'
import { AdminHeader, AdminLoading } from '@/features/admin/components/ui'
import type { CustomerSearchResult } from '@/services/dashboard.service'

// Phase 8 — "Customer Search": free-text search across registrations,
// grouped into one row per customer.
export default function AdminCustomersPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search(value: string) {
    setQ(value)
    if (!value.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(value)}`)
      setResults(res.ok ? await res.json() : [])
    } finally {
      setSearched(true)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Customer Search" description="Search by name, email, mobile, or booking ID." />

      <div className="relative max-w-lg">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/35 focus:outline-none focus:border-gilt-400/60 focus:ring-2 focus:ring-gilt-500/15"
          value={q}
          onChange={(e) => search(e.target.value)}
          placeholder="e.g. Ramesh, 98765..., PST-REG-A1B2C3"
        />
      </div>

      {loading ? (
        <AdminLoading label="Searching…" />
      ) : searched && results.length === 0 ? (
        <EmptyResult q={q} />
      ) : (
        <div className="space-y-3">
          {results.map((c) => (
            <div key={c.email} className="hover-lift rounded-3xl glass gilt-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="flex items-center gap-4 text-xs text-white/50 mt-1.5">
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-gilt-300"><Mail size={12} />{c.email}</a>
                    <a href={`tel:${c.mobile}`} className="flex items-center gap-1 hover:text-gilt-300"><Phone size={12} />{c.mobile}</a>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm text-white/70"><BookOpen size={14} className="text-gilt-400" /> {c.totalBookings} booking(s)</div>
                  <div className="text-xs text-white/40 mt-0.5">Last: {new Date(c.lastBookingAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyResult({ q }: { q: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass gilt-border px-6 py-16 text-center">
      <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/[0.05] text-white/50"><UserX size={26} /></span>
      <h3 className="mt-5 font-display text-xl font-semibold text-white">No customers found</h3>
      <p className="mt-2 text-sm text-white/50">Nothing matches &quot;{q}&quot;. Try a different name, number, or booking ID.</p>
    </div>
  )
}
