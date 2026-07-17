'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2, Sparkles, Info } from 'lucide-react'
import { AdminHeader, Panel, adminControl, luxLabel, primaryBtn, ghostBtn } from '@/features/admin/components/ui'
import type { HomepageContent } from '@/types'

const tips = [
  'Background image should be a landscape photo, at least 1600px wide, for a crisp full-bleed hero on all screens.',
  'Category tile links use query filters, e.g. /tours?cat=spiritual or /tours?cat=leisure.',
  'Leave the secondary button link blank to fall back to the site-wide WhatsApp number.',
  'Changes appear on the live homepage within about 60 seconds (ISR cache).',
]

// Phase 10 CMS — "Homepage" + "Hero Banner". Edits the public homepage
// content via GET/PUT /api/cms/homepage.
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
    const res = await fetch('/api/cms/homepage', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setContent(await res.json())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading || !content) return <div className="text-center py-16 text-white/40">Loading…</div>

  const input = `${adminControl} w-full`

  return (
    <div className="space-y-6">
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit"><ArrowLeft size={15} /> Back to CMS</Link>
      <AdminHeader title="Homepage & Hero Banner" description="Everything on the homepage, editable here.">
        <button onClick={save} disabled={saving} className={primaryBtn}><Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}</button>
      </AdminHeader>
      {saved && <div className="flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 size={15} /> Saved</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Hero Banner">
            <div className="space-y-3">
              <div><label className={luxLabel}>Badge Text</label><input className={input} value={content.hero.badgeText} onChange={(e) => setContent({ ...content, hero: { ...content.hero, badgeText: e.target.value } })} /></div>
              <div><label className={luxLabel}>Title</label><input className={input} value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} /></div>
              <div><label className={luxLabel}>Subtitle</label><input className={input} value={content.hero.subtitle} onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })} /></div>
              <div><label className={luxLabel}>Description</label><textarea className={input} rows={2} value={content.hero.description} onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })} /></div>
              <div><label className={luxLabel}>Background Image URL</label><input className={input} value={content.hero.backgroundImage} onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={luxLabel}>Primary Button Label</label><input className={input} value={content.hero.primaryCtaLabel} onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaLabel: e.target.value } })} /></div>
                <div><label className={luxLabel}>Primary Button Link</label><input className={input} value={content.hero.primaryCtaHref} onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaHref: e.target.value } })} /></div>
                <div><label className={luxLabel}>Secondary Button Label</label><input className={input} value={content.hero.secondaryCtaLabel} onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaLabel: e.target.value } })} /></div>
                <div><label className={luxLabel}>Secondary Button Link</label><input className={input} placeholder="Leave blank to use the WhatsApp link" value={content.hero.secondaryCtaHref} onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaHref: e.target.value } })} /></div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Category Tiles"
            action={<button className={ghostBtn} onClick={() => setContent({ ...content, categoryTiles: [...content.categoryTiles, { title: '', subtitle: '', image: '', href: '' }] })}><Plus size={13} /> Add Tile</button>}
          >
            <div className="space-y-4">
              {content.categoryTiles.map((tile, i) => (
                <div key={i} className="border border-white/5 rounded-2xl p-3 space-y-2 relative bg-white/[0.02]">
                  <button onClick={() => setContent({ ...content, categoryTiles: content.categoryTiles.filter((_, idx) => idx !== i) })} className="absolute top-3 right-3 text-rose-300/70 hover:text-rose-300"><Trash2 size={14} /></button>
                  <div className="grid grid-cols-2 gap-2 pr-6">
                    <input className={input} placeholder="Title" value={tile.title} onChange={(e) => { const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, title: e.target.value }; setContent({ ...content, categoryTiles: tiles }) }} />
                    <input className={input} placeholder="Subtitle" value={tile.subtitle} onChange={(e) => { const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, subtitle: e.target.value }; setContent({ ...content, categoryTiles: tiles }) }} />
                    <input className={input} placeholder="Image URL" value={tile.image} onChange={(e) => { const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, image: e.target.value }; setContent({ ...content, categoryTiles: tiles }) }} />
                    <input className={input} placeholder="Link (e.g. /tours?cat=spiritual)" value={tile.href} onChange={(e) => { const tiles = [...content.categoryTiles]; tiles[i] = { ...tile, href: e.target.value }; setContent({ ...content, categoryTiles: tiles }) }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Why Travel With Us"
            action={<button className={ghostBtn} onClick={() => setContent({ ...content, whyTravelWithUs: [...content.whyTravelWithUs, { title: '', description: '' }] })}><Plus size={13} /> Add Item</button>}
          >
            <div className="space-y-3">
              {content.whyTravelWithUs.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input className={input} placeholder="Title" value={item.title} onChange={(e) => { const items = [...content.whyTravelWithUs]; items[i] = { ...item, title: e.target.value }; setContent({ ...content, whyTravelWithUs: items }) }} />
                    <input className={input} placeholder="Description" value={item.description} onChange={(e) => { const items = [...content.whyTravelWithUs]; items[i] = { ...item, description: e.target.value }; setContent({ ...content, whyTravelWithUs: items }) }} />
                  </div>
                  <button onClick={() => setContent({ ...content, whyTravelWithUs: content.whyTravelWithUs.filter((_, idx) => idx !== i) })} className="text-rose-300/70 hover:text-rose-300 mt-2"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="CTA Section">
            <div className="space-y-3">
              <div><label className={luxLabel}>Title</label><input className={input} value={content.ctaTitle} onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })} /></div>
              <div><label className={luxLabel}>Subtitle</label><input className={input} value={content.ctaSubtitle} onChange={(e) => setContent({ ...content, ctaSubtitle: e.target.value })} /></div>
            </div>
          </Panel>

          <button onClick={save} disabled={saving} className={`${primaryBtn} w-full`}><Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}</button>
        </div>

        {/* Sticky sidebar — fills the wide admin canvas with a live hero
            preview + editing tips, instead of leaving dead space next to a
            narrow single-column form. */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Panel title={<span className="flex items-center gap-2"><Sparkles size={16} className="text-gilt-300" /> Live Preview</span>}>
            <div className="relative h-40 rounded-2xl overflow-hidden border border-white/5">
              {content.hero.backgroundImage && (
                <Image src={content.hero.backgroundImage} alt="" fill sizes="360px" className="object-cover" unoptimized />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/50 to-ink-900/20" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gilt-200 mb-2 truncate max-w-full">{content.hero.badgeText || 'Badge text'}</span>
                <div className="font-display text-lg font-semibold text-white leading-tight truncate">{content.hero.title || 'Hero title'}</div>
                <div className="text-xs text-white/60 truncate">{content.hero.subtitle || 'Subtitle'}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/45 leading-relaxed">This is a rough preview — visit the live homepage to see the full hero with animations.</p>
          </Panel>

          <Panel title={<span className="flex items-center gap-2"><Info size={16} className="text-gilt-300" /> Tips</span>}>
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/55 leading-relaxed">
                  <span className="h-1 w-1 rounded-full bg-gilt-400 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
