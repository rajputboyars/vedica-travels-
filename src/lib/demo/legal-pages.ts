import type { LegalPage, LegalPageType } from '@/types'
import { legalPageLabels } from '@/types'

type Store = { pages: Record<LegalPageType, LegalPage> }

const g = global as unknown as { __demoLegalPagesStore?: Store }

function defaultPage(type: LegalPageType): LegalPage {
  const now = new Date().toISOString()
  const defaults: Record<LegalPageType, string> = {
    terms: 'These terms and conditions govern your use of Parth Saarthi Travels\' services. By booking a package with us, you agree to these terms. Full content to be added by the admin via the CMS.',
    privacy: 'We respect your privacy. This policy explains what information we collect during booking and how it is used. Full content to be added by the admin via the CMS.',
    refund: 'Cancellations and refund requests are handled on a case-by-case basis. Please contact our team for assistance. Full content to be added by the admin via the CMS.',
  }
  return {
    _id: `demo-legal-${type}`,
    type,
    title: legalPageLabels[type],
    content: defaults[type],
    updatedAt: now,
  }
}

if (!g.__demoLegalPagesStore) {
  g.__demoLegalPagesStore = {
    pages: {
      terms: defaultPage('terms'),
      privacy: defaultPage('privacy'),
      refund: defaultPage('refund'),
    },
  }
}

const store = g.__demoLegalPagesStore

export function getLegalPage(type: LegalPageType): LegalPage {
  return store.pages[type]
}

export function getAllLegalPages(): LegalPage[] {
  return [store.pages.terms, store.pages.privacy, store.pages.refund]
}

export function upsertLegalPage(type: LegalPageType, data: Partial<LegalPage>): LegalPage {
  store.pages[type] = { ...store.pages[type], ...data, type, updatedAt: new Date().toISOString() }
  return store.pages[type]
}
