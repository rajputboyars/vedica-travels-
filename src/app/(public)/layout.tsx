import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteSettings } from '@/services/cms.service'

// Phase 10 CMS -- contact info + social links are fetched once here and
// passed down to both Navbar and Footer, instead of each one reading
// config/site.ts directly.
//
// Phase 11 caching -- getSiteSettings() is a direct Mongoose read, not a
// fetch(), so it doesn't participate in Next's fetch Data Cache. Setting
// revalidate here makes Next statically render + cache this layout's
// output (Full Route Cache / ISR) instead of hitting the DB on every
// request. Nested pages may set a shorter revalidate; the effective
// value for any request is the minimum across the layout/page chain.
export const revalidate = 120

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  // Phase 11 SEO -- one Organization/TravelAgency JSON-LD block for the
  // whole public site (business identity + contact points), emitted once
  // here rather than duplicated per-page.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: settings.siteName,
    description: settings.description,
    telephone: settings.contact.primaryPhone,
    email: settings.contact.email,
    address: { '@type': 'PostalAddress', streetAddress: settings.address.line1, addressLocality: settings.address.line2 },
    sameAs: Object.values(settings.social || {}).filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  )
}
