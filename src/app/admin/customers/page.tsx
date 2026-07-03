'use client'
import { useState } from 'react'
import { Search, Phone, Mail, BookOpen } from 'lucide-react'
import type { CustomerSearchResult } from '@/services/dashboard.service'

// Phase 8 — "Customer Search": free-text search across registrations
// (name/email/mobile/booking ID), grouped into one row per customer.
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Customer Search</h1>
        <p className="text-gray-500 text-sm">Search by name, email, mobile, or booking ID</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={q}
          onChange={(e) => search(e.target.value)}
          placeholder="e.g. Ramesh, 98765..., PST-REG-A1B2C3"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Searching...</div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No customers match &quot;{q}&quot;.</div>
      ) : (
        <div className="space-y-3">
          {results.map((c) => (
            <div key={c.email} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-orange-600"><Mail size={12} />{c.email}</a>
                    <a href={`tel:${c.mobile}`} className="flex items-center gap-1 hover:text-orange-600"><Phone size={12} />{c.mobile}</a>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600"><BookOpen size={14} /> {c.totalBookings} booking(s)</div>
                  <div className="text-xs text-gray-400 mt-0.5">Last: {new Date(c.lastBookingAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
