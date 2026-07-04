import type { MetadataRoute } from 'next'
import { env } from '@/config/env'
import { listPackages } from '@/services/package.service'
import { listTours } from '@/services/tour.service'
import { listBlogs } from '@/services/cms.service'

// Phase 11 SEO -- expanded from the earlier tours-only sitemap to cover
// every public route: static pages plus published Packages,
// upcoming/ongoing Tours, and published Blogs. Draft/hidden/archived
// content and anything behind auth (dashboard, admin) is intentionally
// excluded -- see robots.ts for the matching disallow rules on those
// sections.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (env.appUrl || env.nextAuthUrl || 'http://localhost:3000').replace(/\/$/, '')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/tours`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/packages`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/blogs`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/faqs`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/refund-policy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const [packages, tours, blogs] = await Promise.all([
    listPackages({ status: 'published' }),
    listTours(),
    listBlogs({ status: 'published' }),
  ])

  const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
    url: `${base}/packages/${pkg.slug}`,
    lastModified: pkg.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tourRoutes: MetadataRoute.Sitemap = tours
    .filter((t) => t.status !== 'completed')
    .map((tour) => ({
      url: `${base}/tours/${tour._id}`,
      lastModified: tour.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${base}/blogs/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...packageRoutes, ...tourRoutes, ...blogRoutes]
}
