'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LegalPage, LegalPageType } from '@/types'
import { legalPageLabels } from '@/types'

const TYPES: LegalPageType[] = ['terms', 'privacy', 'refund']

// Phase 10 CMS — "Terms" + "Privacy Policy" + "Refund Policy". One page
// with three tabs since they share the exact same shape (title + long-
// form content) — same reasoning as LegalPage being one model with a
// `type` enum rather than three separate models.
export default function AdminLegalPagesPage() {
  const [active, setActive] = useState<LegalPageType>('terms')
  const [pages, setPages] = useState<Record<LegalPageType, LegalPage | null>>({ terms: null, privacy: null, refund: null })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/cms/legal-pages')
      .then((r) => r.json())
      .then((all: LegalPage[]) => {
        const byType: Record<LegalPageType, LegalPage | null> = { terms: null, privacy: null, refund: null }
        for (const p of all) byType[p.type] = p
        setPages(byType)
      })
  }, [])

  const current = pages[active]

  function updateCurrent(patch: Partial<LegalPage>) {
    setPages((prev) => ({ ...prev, [active]: prev[active] ? { ...prev[active]!, ...patch } : null }))
  }

  async function save() {
    if (!current) return
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/cms/legal-pages/${active}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: current.title, content: current.content }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPages((prev) => ({ ...prev, [active]: updated }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/admin/cms" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Legal Pages</h1>
        <p className="text-gray-500 text-sm">Shown in the site footer for every visitor</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              active === t ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {legalPageLabels[t]}
          </button>
        ))}
      </div>

      {!current ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={current.title}
                onChange={(e) => updateCurrent({ title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                rows={16}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 font-mono"
                value={current.content}
                onChange={(e) => updateCurrent({ content: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Plain text — line breaks are preserved on the public page.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {saved && <div className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 size={15} /> Saved</div>}
      <Button onClick={save} disabled={saving || !current} className="w-full">
        <Save size={15} className="mr-1" /> {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}
