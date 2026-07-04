'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SiteSettings } from '@/types'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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
    const res = await fetch('/api/cms/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setSettings(await res.json())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading || !settings) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/admin/cms" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contact Info & Social Media</h1>
          <p className="text-gray-500 text-sm">Drives the Navbar, Footer, and Contact page site-wide</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save size={15} className="mr-1" /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {saved && <div className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 size={15} /> Saved</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Brand</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Site Name</label>
            <input className={inputClass} value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Short Name</label>
            <input className={inputClass} value={settings.shortName} onChange={(e) => setSettings({ ...settings, shortName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Tagline (local language)</label>
            <input className={inputClass} value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Tagline (English)</label>
            <input className={inputClass} value={settings.taglineEn} onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Founder</label>
            <input className={inputClass} value={settings.founder} onChange={(e) => setSettings({ ...settings, founder: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Contact</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setSettings({ ...settings, contact: { ...settings.contact, phones: [...settings.contact.phones, ''] } })}>
            <Plus size={13} className="mr-1" /> Add Phone
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.contact.phones.map((phone, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputClass} value={phone} onChange={(e) => {
                const phones = [...settings.contact.phones]; phones[i] = e.target.value
                setSettings({ ...settings, contact: { ...settings.contact, phones } })
              }} />
              <button onClick={() => setSettings({ ...settings, contact: { ...settings.contact, phones: settings.contact.phones.filter((_, idx) => idx !== i) } })} className="text-red-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div>
            <label className={labelClass}>Primary Phone (shown most prominently)</label>
            <input className={inputClass} value={settings.contact.primaryPhone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, primaryPhone: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>WhatsApp Number (with country code, e.g. 919773834051)</label>
            <input className={inputClass} value={settings.contact.whatsapp} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Availability</label>
            <input className={inputClass} value={settings.contact.availability} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, availability: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input className={inputClass} placeholder="Line 1" value={settings.address.line1} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line1: e.target.value } })} />
          <input className={inputClass} placeholder="Line 2" value={settings.address.line2} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, line2: e.target.value } })} />
          <input className={inputClass} placeholder="Pickup Point Label" value={settings.address.pickupLabel} onChange={(e) => setSettings({ ...settings, address: { ...settings.address, pickupLabel: e.target.value } })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Social Media</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Instagram URL</label>
            <input className={inputClass} value={settings.social?.instagram || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input className={inputClass} value={settings.social?.facebook || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>YouTube URL</label>
            <input className={inputClass} value={settings.social?.youtube || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, youtube: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Twitter/X URL</label>
            <input className={inputClass} value={settings.social?.twitter || ''} onChange={(e) => setSettings({ ...settings, social: { ...settings.social, twitter: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Homepage Stats Bar</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Happy Travellers</label>
            <input className={inputClass} value={settings.stats.happyTravellers} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, happyTravellers: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Trips Completed</label>
            <input className={inputClass} value={settings.stats.tripsCompleted} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, tripsCompleted: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Destinations</label>
            <input className={inputClass} value={settings.stats.destinations} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, destinations: e.target.value } })} />
          </div>
          <div>
            <label className={labelClass}>Average Rating</label>
            <input className={inputClass} value={settings.stats.averageRating} onChange={(e) => setSettings({ ...settings, stats: { ...settings.stats, averageRating: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        <Save size={15} className="mr-1" /> {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}
