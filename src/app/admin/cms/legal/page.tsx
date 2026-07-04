'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminHeader, Panel, adminControl, primaryBtn, luxLabel } from '@/features/admin/components/ui'
import type { LegalPage, LegalPageType } from '@/types'
import { legalPageLabels } from '@/types'

const TYPES: LegalPageType[] = ['terms', 'privacy', 'refund']

// Phase 10 CMS — "Terms" + "Privacy Policy" + "Refund Policy". One page
// with three tabs since they share the exact same shape.
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
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <AdminHeader title="Legal Pages" description="Shown in the site footer for every visitor." />

      <div className="flex gap-2 border-b border-white/10">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', active === t ? 'border-gilt-400 text-gilt-300' : 'border-transparent text-white/50 hover:text-white')}
          >
            {legalPageLabels[t]}
          </button>
        ))}
      </div>

      {!current ? (
        <div className="text-center py-12 text-white/40">Loading…</div>
      ) : (
        <Panel>
          <div className="space-y-4">
            <div>
              <label className={luxLabel}>Page Title</label>
              <input className={`${adminControl} w-full`} value={current.title} onChange={(e) => updateCurrent({ title: e.target.value })} />
            </div>
            <div>
              <label className={luxLabel}>Content</label>
              <textarea rows={16} className={`${adminControl} w-full font-mono`} value={current.content} onChange={(e) => updateCurrent({ content: e.target.value })} />
              <p className="text-xs text-white/40 mt-1">Plain text — line breaks are preserved on the public page.</p>
            </div>
          </div>
        </Panel>
      )}

      {saved && <div className="flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 size={15} /> Saved</div>}
      <button onClick={save} disabled={saving || !current} className={`${primaryBtn} w-full`}>
        <Save size={15} /> {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
