'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, Plus, Trash2, Phone, Mail, MapPin, MessageCircle, Info } from 'lucide-react'
import { AdminHeader, Panel, adminControl, luxLabel, primaryBtn, ghostBtn } from '@/features/admin/components/ui'
import type { SiteSettings } from '@/types'

const usedIn = [
  'Navbar — primary phone + Login/Book Now bar',
  'Footer — all phones, WhatsApp, email, address, social links',
  'Contact page — every field on this form',
  'Homepage stats bar — the four numbers below',
]

// Phase 10 CMS — "Contact Information" + "Social Media". Powers the
// Navbar/Footer/Contact page via GET/PUT /api/cms/site-settings.
export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/cms/site-settings').then((r) => r.json()).then((data) => { setSettings(data); setLoading(false) })
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    const { _id, updatedAt, ...payload } = settings
    void _id
    void updatedAt
    const res = await fetch('/api/cms/site-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setSettings(await res.json())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading || !settings) return <div className="text-center py-16 text-white/40">Loading…</div>

  const input = `${adminControl} w-full`

  return (
    <div className="space-y-6">
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit"><ArrowLeft size={15} /> Back to CMS</Link>
      <AdminHeader title="Contact Info & Social Media" description="Drives the Navbar, Footer, and Contact page site-wide.">
        <button onClick={save} disabled={saving} className={primaryBtn}><Save size={15} /> {saving ? 'Saving…' : 'Save'}</button>
      </AdminHeader>
      {saved && <div className="flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 size={15} /> Saved</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Brand">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={luxLabel}>Site Name</label><input className={input} value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></div>
              <div><label className={luxLabel}>Short Name</label><input className={input} value={settings.shortName} onChange={(e) => setSettings({ ...settings, shortName: e.target.value })} /></div>
              <div><label className={luxLabel}>Tagline (local language)</label><input className={input} value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></div>
              <div><label className={luxLabel}>Tagline (English)</label><input className={input} value={settings.taglineEn} onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })} /></div>
              <div className="col-span-2"><label className={luxLabel}>Description</label><textarea className={input} rows={2} value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} /></div>
              <div><label className={luxLabel}>Founder</label><input className={input} value={settings.founder} onChange={(e) => setSettings({ ...settings, founder: e.target.value })} /></div>
            </div>
          </Panel>

          <Panel
            title="Contact"
            action={<button className={ghostBtn} onClick={() => setSettings({ ...settings, contact: { ...settings.contact, phones: [...settings.contact.phones, ''] } })}><Plus size={13} /> Add Phone</button>}
          >
            <div className="space-y-3">
              {settings.contact.phones.map((phone, i) => (
                <div key={i} className="flex gap-2">
                  <input className={input} value={phone} onChange={(e) => { const phones = [...settings.contact.phones]; phones[i] = e.target.value; setSettings({ ...settings, contact: { ...settings.contact, phones } }) }} />
                  <button onClick={() => setSettings({ ...settings, contact: { ...settings.contact, phones: settings.contact.phones.filter((_, idx) => idx !== i) } })} className="text-rose-300/70 hover:text-rose-300"><Trash2 size={14} /></button>
                </div>
              ))}
              <div><label className={luxLabel}>Primary Phone (shown most prominently)</label><input className={input} value={settings.contact.primaryPhone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, primaryPhone: e.target.value } })} /></div>
              <div><label className={luxLabel}>WhatsApp Number (with country code)</label><input className={input} value={settings.contact.whatsapp} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })} /></div>
              <div><label className={luxLabel}>Email</label><input className={input} value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} /></div>
              <div><label className={luxLabel}>Availability</label><input className={input} value={settings.contact.availability} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, availability: e.target.value } })} /></div>
            </div>
          </Panel>

          <Panel title="Address">
            <div className="space-y-3">
              <input className={input} placeholder="Line 1" value={settings.address.line1} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line1: e.target.value } })} />
              <input className={input} placeholder="Line 2" value={settings.address.line2} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line2: e.target.value } })} />
              <input className={input} placeholder="Pickup Point Label" value={settings.address.pickupLabel} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, pickupLabel: e.target.value } })} />
            </div>
          </Panel>

          <Panel title="Social Media">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={luxLabel}>Instagram URL</label><input className={input} value={settings.social?.instagram || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })} /></div>
              <div><label className={luxLabel}>Facebook URL</label><input className={input} value={settings.social?.facebook || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })} /></div>
              <div><label className={luxLabel}>YouTube URL</label><input className={input} value={settings.social?.youtube || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, youtube: e.target.value } })} /></div>
              <div><label className={luxLabel}>Twitter/X URL</label><input className={input} value={settings.social?.twitter || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, twitter: e.target.value } })} /></div>
            </div>
          </Panel>

          <Panel title="Homepage Stats Bar">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={luxLabel}>Happy Travellers</label><input className={input} value={settings.stats.happyTravellers} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, happyTravellers: e.target.value } })} /></div>
              <div><label className={luxLabel}>Trips Completed</label><input className={input} value={settings.stats.tripsCompleted} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, tripsCompleted: e.target.value } })} /></div>
              <div><label className={luxLabel}>Destinations</label><input className={input} value={settings.stats.destinations} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, destinations: e.target.value } })} /></div>
              <div><label className={luxLabel}>Average Rating</label><input className={input} value={settings.stats.averageRating} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, averageRating: e.target.value } })} /></div>
            </div>
          </Panel>

          <button onClick={save} disabled={saving} className={`${primaryBtn} w-full`}><Save size={15} /> {saving ? 'Saving…' : 'Save'}</button>
        </div>

        {/* Sticky sidebar — live contact-card preview + where each field
            surfaces site-wide, instead of leaving the wide canvas empty
            next to a narrow single-column form. */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Panel title="Live Preview">
            <div className="space-y-2.5 text-sm">
              {settings.contact.primaryPhone && (
                <div className="flex items-center gap-2.5 text-white/75"><Phone size={13} className="text-gilt-300 shrink-0" /> {settings.contact.primaryPhone}</div>
              )}
              {settings.contact.whatsapp && (
                <div className="flex items-center gap-2.5 text-white/75"><MessageCircle size={13} className="text-emerald-300 shrink-0" /> WhatsApp: {settings.contact.whatsapp}</div>
              )}
              {settings.contact.email && (
                <div className="flex items-center gap-2.5 text-white/75"><Mail size={13} className="text-gilt-300 shrink-0" /> {settings.contact.email}</div>
              )}
              {(settings.address.line1 || settings.address.line2) && (
                <div className="flex items-start gap-2.5 text-white/60"><MapPin size={13} className="text-gilt-300 shrink-0 mt-0.5" /> <span>{settings.address.line1}{settings.address.line1 && settings.address.line2 && ', '}{settings.address.line2}</span></div>
              )}
            </div>
          </Panel>

          <Panel title={<span className="flex items-center gap-2"><Info size={16} className="text-gilt-300" /> Where This Appears</span>}>
            <ul className="space-y-2.5">
              {usedIn.map((line, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/55 leading-relaxed">
                  <span className="h-1 w-1 rounded-full bg-gilt-400 mt-1.5 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
