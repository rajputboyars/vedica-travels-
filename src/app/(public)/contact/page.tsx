import type { Metadata } from 'next'
import { Phone, MapPin, MessageCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { phoneHref } from '@/config/site'
import { getSiteSettings } from '@/services/cms.service'

// Phase 11 caching -- contact info changes infrequently.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    // Root layout's title.template appends " | <siteName>" automatically
    // (see app/layout.tsx), so page-level titles here are just the page
    // name -- avoids "Contact Us | Brand | Brand" duplication.
    title: 'Contact Us',
    description: `Get in touch with ${settings.siteName} to plan your next spiritual yatra or holiday trip. Call, WhatsApp, or visit our pickup point.`,
    openGraph: { title: 'Contact Us', description: `Get in touch with ${settings.siteName} for your next yatra or trip.` },
  }
}

// Phase 10 CMS -- "Contact Information": every value here now comes from
// SiteSettings (editable at /admin/cms/site-settings) instead of the
// hardcoded config/site.ts constants.
export default async function ContactPage() {
  const settings = await getSiteSettings()
  const whatsappUrl = `https://wa.me/${settings.contact.whatsapp}`

  const items = [
    {
      icon: <Phone className="text-orange-600" size={24} />,
      title: 'Phone',
      content: (
        <div className="space-y-1">
          {settings.contact.phones.map((phone) => (
            <a key={phone} href={phoneHref(phone)} className="block text-orange-600 hover:underline font-medium">{phone}</a>
          ))}
        </div>
      ),
    },
    {
      icon: <MessageCircle className="text-green-600" size={24} />,
      title: 'WhatsApp',
      content: <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">Chat on WhatsApp</a>,
    },
    {
      icon: <MapPin className="text-orange-600" size={24} />,
      title: 'Pickup Point',
      content: <div className="text-gray-600">{settings.address.line1}<br />{settings.address.line2}</div>,
    },
    {
      icon: <Clock className="text-orange-600" size={24} />,
      title: 'Contact Person',
      content: <div className="text-gray-600 font-medium">{settings.founder}</div>,
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-orange-100">We&apos;re here to help you plan your sacred journey</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>
            {items.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
                    {item.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-gray-600 mb-4">Reach us directly via:</p>
              <div className="space-y-3">
                <a href={phoneHref(settings.contact.primaryPhone)} className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  <Phone size={18} /> Call Now: {settings.contact.primaryPhone}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                  <MessageCircle size={18} /> WhatsApp: {settings.contact.primaryPhone}
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-4">{settings.contact.availability}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
