import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, User as UserIcon, ArrowLeft } from 'lucide-react'
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

const FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop'

// Phase 10 CMS -- "Blogs" detail page.
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
    <div className="lux">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero with cover image */}
      <section className="relative overflow-hidden px-6 pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Image src={blog.coverImage || FALLBACK} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/75 to-ink-900" />
        <div className="aura absolute inset-0" />
        <div className="relative max-w-3xl mx-auto">
          <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-gilt-300 hover:underline">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          {blog.tags[0] && <div className="mt-6 text-xs uppercase tracking-[0.22em] text-gilt-400">{blog.tags[0]}</div>}
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1]">{blog.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/55">
            <span className="flex items-center gap-1.5"><UserIcon size={14} className="text-gilt-400" /> {blog.author}</span>
            {blog.publishedAt && (
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gilt-400" /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <article className="max-w-3xl mx-auto">
          <div className="rounded-3xl glass gilt-border p-8 sm:p-10">
            <div className="whitespace-pre-wrap leading-relaxed text-white/75">{blog.content}</div>
            {blog.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-white/5 pt-6">
                {blog.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gilt-400/10 border border-gilt-500/20 px-3 py-1 text-xs text-gilt-300">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
