'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HomepageContent } from '@/types'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

// Phase 10 CMS — "Homepage" + "Hero Banner". Edits
// src/app/(public)/page.tsx's content via GET/PUT /api/cms/homepage;
// nothing here is hardcoded once this ships (see that page's Phase 10
// rewrite).
export default function AdminHomepageCmsPage() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/cms/homepage').then((r) => r.json()).then((data) => { setContent(data); setLoading(false) })
  }, [])

  async function save() {
    if (!content) return
    setSaving(true)
    setSaved(false)
    const { _id, updatedAt, ...payload } = content
    void _id
    void updatedAt
    const res = await fetch('/api/cms/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setContent(await res.json())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading || !content) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/cms" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Homepage & Hero Banner</h1>
          <p className="text-gray-500 text-sm">Everything on the homepage, editable here</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save size={15} className="mr-1" /> {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
      {saved && <div className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 size={15} /> Saved</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Hero Banner</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className={labelClass}>Badge Text</label>
            <input className={inputClass} value={content.hero.badgeText} onChange={(e) => setContent({ ...content, hero: { ...content.hero, badgeText: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input className={inputClass} value={content.hero.subtitle} onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={content.hero.description} onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Background Image URL</label>
            <input className={inputClass} value={content.hero.backgroundImage} onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Primary Button Label</label>
              <input className={inputClass} value={content.hero.primaryCtaLabel} onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaLabel: e.target.value } })} />
            </div>
            <div>
              <label className={labelClass}>Primary Button Link</label>
              <input className={inputClass} value={content.hero.primaryCtaHref} onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaHref: e.target.value } })} />
            </div>
            <div>
              <label className={labelClass}>Secondary Button Label</label>
              <input className={inputClass} value={content.hero.secondaryCtaLabel} onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaLabel: e.target.value } })} />
            </div>
            <div>
              <label className={labelClass}>Secondary Button Link</label>
              <input className={inputClass} placeholder="Leave blank to use the WhatsApp link" value={content.hero.secondaryCtaHref} onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaHref: e.target.value } })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Category Tiles</CardTitle>
          <Button
            size="sm" variant="outline"
            onClick={() => setContent({ ...content, categoryTiles: [...content.categoryTiles, { title: '', subtitle: '', image: '', href: '' }] })}
          >
            <Plus size={13} className="mr-1" /> Add Tile
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.categoryTiles.map((tile, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
              <button
                onClick={() => setContent({ ...content, categoryTiles: content.categoryTiles.filter((_, idx) => idx !== i) })}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-2 gap-2 pr-6">
                <input className={inputClass} placeholder="Title" value={tile.title} onChange={(e) => {
                  const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, title: e.target.value }; setContent({ ...content, categoryTiles: tiles })
                }} />
                <input className={inputClass} placeholder="Subtitle" value={tile.subtitle} onChange={(e) => {
                  const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, subtitle: e.target.value }; setContent({ ...content, categoryTiles: tiles })
                }} />
                <input className={inputClass} placeholder="Image URL" value={tile.image} onChange={(e) => {
                  const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, image: e.target.value }; setContent({ ...content, categoryTiles: tiles })
                }} />
                <input className={inputClass} placeholder="Link (e.g. /tours?cat=spiritual)" value={tile.href} onChange={(e) => {
                  const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, href: e.target.value }; setContent({ ...content, categoryTiles: tiles })
                }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Why Travel With Us</CardTitle>
          <Button
            size="sm" variant="outline"
            onClick={() => setContent({ ...content, whyTravelWithUs: [...content.whyTravelWithUs, { title: '', description: '' }] })}
          >
            <Plus size={13} className="mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.whyTravelWithUs.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Title" value={item.title} onChange={(e) => {
                  const items = [...content.whyTravelWithUs]; items[i] = { ...item, title: e.target.value }; setContent({ ...content, whyTravelWithUs: items })
                }} />
                <input className={inputClass} placeholder="Description" value={item.description} onChange={(e) => {
                  const items = [...content.whyTravelWithUs]; items[i] = { ...item, description: e.target.value }; setContent({ ...content, whyTravelWithUs: items })
                }} />
              </div>
              <button onClick={() => setContent({ ...content, whyTravelWithUs: content.whyTravelWithUs.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600 mt-2">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">CTA Section</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={content.ctaTitle} onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input className={inputClass} value={content.ctaSubtitle} onChange={(e) => setContent({ ...content, ctaSubtitle: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        <Save size={15} className="mr-1" /> {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  )
}
