import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, User as UserIcon, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { listBlogs, getSiteSettings } from '@/services/cms.service'

// Phase 11 caching -- blog posts change rarely once published, so a
// longer ISR window than the seat-sensitive pages is appropriate.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const description = `Travel stories, pilgrimage guides, and tips from ${settings.siteName} — spiritual tourism and holiday travel insights.`
  return {
    // Root layout's title.template appends " | <siteName>" automatically.
    title: 'Blogs',
    description,
    openGraph: { title: 'Blogs', description },
  }
}

// Phase 10 CMS -- "Blogs": public list of published posts, sourced from
// the same Blog collection the admin CMS (/admin/cms/blogs) manages.
export default async function BlogsPage() {
  const blogs = await listBlogs({ status: 'published' })

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Travel Blog</h1>
        <p className="text-orange-100">Stories, guides & tips for your next yatra or holiday</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">No blog posts yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  {blog.coverImage && (
                    <div className="relative w-full h-44">
                      <Image src={blog.coverImage} alt={blog.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h2>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><UserIcon size={12} /> {blog.author}</span>
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-orange-600 text-sm font-medium flex items-center gap-1">
                      Read more <ArrowRight size={14} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
