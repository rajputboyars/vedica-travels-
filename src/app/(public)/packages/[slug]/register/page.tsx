import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getPackageBySlug } from '@/services/package.service'
import RegistrationForm from '@/features/registration/components/RegistrationForm'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Package not found' }
  // Root layout's title.template appends " | <siteName>" automatically.
  return { title: `Register — ${pkg.title}` }
}

export default async function PackageRegisterPage({ params }: PageProps) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/packages/${pkg.slug}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 mb-4">
          <ArrowLeft size={15} /> Back to {pkg.title}
        </Link>
        <div className="bg-white rounded-xl shadow-sm p-6">
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
  )
}
