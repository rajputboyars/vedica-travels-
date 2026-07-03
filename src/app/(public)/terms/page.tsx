import type { Metadata } from 'next'
import { getLegalPage } from '@/services/cms.service'
import LegalPageView from '@/features/cms/components/LegalPageView'

// Phase 11 caching -- legal pages change rarely; a long ISR window is fine.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('terms')
  return { title: page.title, description: page.content.replace(/\s+/g, ' ').slice(0, 160) }
}

export default async function TermsPage() {
  const page = await getLegalPage('terms')
  return <LegalPageView page={page} />
}
