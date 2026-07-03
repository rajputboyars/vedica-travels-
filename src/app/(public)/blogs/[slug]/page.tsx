import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, User as UserIcon, ArrowLeft, Tag } from 'lucide-react'
import { getBlogBySlug } from '@/services/cms.service'

interface Props {
  params: Promise<{ slug: string }>
}

// Phase 11 caching -- same rationale as the blog list page.
export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) return { title: 'Blog' }
  // An admin-set metaTitle is a deliberate full SEO-title override, so it
  // bypasses the root layout's " | <siteName>" template (`absolute`);
  // the fallback (post title) still goes through the template normally.
  return {
    title: blog.metaTitle ? { absolute: blog.metaTitle } : blog.title,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : undefined,
      type: 'article',
    },
  }
}

// Phase 10 CMS -- "Blogs" detail page. getBlogBySlug() already 404s
// non-published posts for non-admin visitors (see cms.service.ts), so
// this page just needs to call notFound() when it returns null.
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog || blog.status !== 'published') notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.coverImage ? [blog.coverImage] : undefined,
    author: { '@type': 'Person', name: blog.author },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
  }

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {blog.coverImage && (
        <div className="relative h-72 sm:h-96">
          <Image src={blog.coverImage} alt={blog.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/blogs" className="inline-flex items-center gap-1 text-orange-600 text-sm font-medium mb-6 hover:underline">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1"><UserIcon size={14} /> {blog.author}</span>
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {blog.tags.length > 0 && (
            <span className="flex items-center gap-1 flex-wrap">
              <Tag size={14} />
              {blog.tags.map((tag) => (
                <span key={tag} className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-xs">{tag}</span>
              ))}
            </span>
          )}
        </div>

        <div className="prose prose-orange max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
          {blog.content}
        </div>
      </div>
    </div>
  )
}
