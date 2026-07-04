import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Image as ImageIcon, MessageSquareQuote, Newspaper, HelpCircle, FileText, Settings, ArrowRight } from 'lucide-react'

// Phase 10 — Admin CMS hub. One nav entry ("Website CMS") fans out into
// all the content sections the project spec calls for, instead of
// bloating the main admin sidebar with six more top-level links.
const sections = [
  { href: '/admin/cms/homepage', label: 'Homepage & Hero Banner', icon: Home, desc: 'Hero text, category tiles, "Why Travel With Us", CTA section' },
  { href: '/admin/cms/site-settings', label: 'Contact Info & Social Media', icon: Settings, desc: 'Phones, WhatsApp, email, address, social links, stats bar' },
  { href: '/admin/packages', label: 'Packages', icon: FileText, desc: 'Already managed in Admin → Packages' },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, desc: 'Already managed in Admin → Gallery' },
  { href: '/admin/cms/testimonials', label: 'Testimonials', icon: MessageSquareQuote, desc: 'Customer reviews shown on the homepage' },
  { href: '/admin/cms/blogs', label: 'Blogs', icon: Newspaper, desc: 'Articles shown on the public /blogs page' },
  { href: '/admin/cms/faqs', label: 'FAQs', icon: HelpCircle, desc: 'Frequently asked questions shown on /faqs' },
  { href: '/admin/cms/legal', label: 'Terms, Privacy & Refund Policy', icon: FileText, desc: 'Legal pages shown in the site footer' },
]

export default function AdminCmsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Website CMS</h1>
        <p className="text-gray-500 text-sm">Manage every piece of content on the public site — nothing is hardcoded.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <s.icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-1">
                    {s.label} <ArrowRight size={14} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
