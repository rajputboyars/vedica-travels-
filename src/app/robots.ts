import type { MetadataRoute } from 'next'
import { env } from '@/config/env'

// Phase 11 SEO -- disallow admin (already there) plus the logged-in
// customer dashboard and auth flows (login/register/verify/reset), none
// of which have any public SEO value and would otherwise show up as thin
// duplicate/auth-walled pages in search results.
export default function robots(): MetadataRoute.Robots {
  const base = (env.appUrl || env.nextAuthUrl || 'http://localhost:3000').replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
