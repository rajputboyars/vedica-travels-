import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, User as UserIcon, ArrowUpRight, Newspaper } from 'lucide-react'
import PageHero from '@/components/lux/PageHero'
import Reveal from '@/features/home/components/Reveal'
import EmptyState from '@/components/lux/EmptyState'
import { listBlogs, getSiteSettings } from '@/services/cms.service'

// Phase 11 caching -- blog posts change rarely once published.
export const revalidate = 300

const FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80&auto=format&fit=crop'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const description = `Travel stories, pilgrimage guides, and tips from ${settings.siteName} — spiritual tourism and holiday travel insights.`
  return {
    title: 'Blogs',
    description,
    openGraph: { title: 'Blogs', description },
  }
}

// Phase 10 CMS -- "Blogs": public list of published posts.
export default async function BlogsPage() {
  const blogs = await listBlogs({ status: 'published' })

  return (
    <div className="lux">
      <PageHero
        eyebrow="Travel journal"
        title="Stories &"
        highlight="guides"
        description="Tips, temple guides and travel inspiration for your next yatra or holiday."
        crumbs={[{ label: 'Blog' }]}
      />

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {blogs.length === 0 ? (
            <EmptyState icon={Newspaper} title="No stories yet" description="We're working on fresh travel guides — check back soon." action={{ label: 'Explore trips', href: '/tours' }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {blogs.map((blog, i) => (
                <Reveal key={blog._id} delay={(i % 3) * 60}>
                  <Link href={`/blogs/${blog.slug}`} className="hover-lift group flex flex-col h-full overflow-hidden rounded-3xl glass gilt-border">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={blog.coverImage || FALLBACK} alt={blog.title} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.1s] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      {blog.tags[0] && <span className="text-[11px] uppercase tracking-[0.2em] text-gilt-300">{blog.tags[0]}</span>}
                      <h2 className="mt-2 font-display text-lg font-semibold text-white leading-snug line-clamp-2 group-hover:text-gilt-200 transition-colors">{blog.title}</h2>
                      <p className="mt-2 flex-1 text-sm text-white/55 line-clamp-2">{blog.excerpt}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/45">
                        <span className="flex items-center gap-1.5"><UserIcon size={12} /> {blog.author}</span>
                        {blog.publishedAt && (
                          <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gilt-300">Read more <ArrowUpRight size={14} /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
