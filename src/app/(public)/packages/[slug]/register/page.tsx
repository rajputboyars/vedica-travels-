import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getPackageBySlug } from '@/services/package.service'
import RegistrationForm from '@/features/registration/components/RegistrationForm'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Package not found' }
  return { title: `Register — ${pkg.title}` }
}

const BG = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1400&q=80&auto=format&fit=crop'

export default async function PackageRegisterPage({ params }: PageProps) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  return (
    <div className="lux relative min-h-screen">
      <Image src={BG} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/90 to-ink-900" />
      <div className="aura absolute inset-0" />

      <div className="relative px-4 pt-28 pb-16">
        <div className="max-w-2xl mx-auto">
          <Link href={`/packages/${pkg.slug}`} className="inline-flex items-center gap-1.5 text-sm text-gilt-300 hover:underline mb-5">
            <ArrowLeft size={15} /> Back to {pkg.title}
          </Link>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.28em] text-gilt-400">Secure your seat</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-white leading-tight">{pkg.title}</h1>
          </div>
          {/* Light island keeps the working multi-step registration form legible */}
          <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-gilt-500/20">
            <RegistrationForm
              packageId={pkg._id}
              packageTitle={pkg.title}
              price={pkg.price}
              paymentNote={pkg.paymentNote}
              qrImages={pkg.qrImages}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
