import Link from 'next/link'
import { Home, Image as ImageIcon, MessageSquareQuote, Newspaper, HelpCircle, FileText, Settings, ArrowUpRight } from 'lucide-react'
import { AdminHeader } from '@/features/admin/components/ui'

// Phase 10 — Admin CMS hub. One nav entry ("Website CMS") fans out into all
// the content sections instead of bloating the main admin sidebar.
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
    <div className="space-y-8">
      <AdminHeader title="Website CMS" description="Manage every piece of content on the public site — nothing is hardcoded." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="hover-lift group flex items-start gap-4 rounded-3xl glass gilt-border p-6">
            <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-gilt-400/15 text-gilt-300 transition-transform duration-500 group-hover:scale-105">
              <s.icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white flex items-center gap-1.5">
                {s.label} <ArrowUpRight size={15} className="text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-sm text-white/50 mt-1">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
