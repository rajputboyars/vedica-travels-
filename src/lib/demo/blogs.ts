import type { Blog } from '@/types'

type Store = { blogs: Blog[]; seeded: boolean }

const g = global as unknown as { __demoBlogsStore?: Store }

if (!g.__demoBlogsStore) {
  g.__demoBlogsStore = { blogs: [], seeded: false }
}

const store = g.__demoBlogsStore

function seed() {
  if (store.seeded) return
  store.seeded = true
  const now = new Date().toISOString()
  store.blogs = [
    {
      _id: 'demo-blog-1',
      title: 'A Complete Guide to Khatu Shyam Ji Yatra',
      slug: 'complete-guide-khatu-shyam-ji-yatra',
      excerpt: 'Everything you need to know before booking your Khatu Shyam Ji darshan — best season, what to pack, and travel tips.',
      content:
        'Khatu Shyam Ji is one of the most revered pilgrimage destinations in Rajasthan. In this guide, we cover the best time to visit, how to plan your travel, and what our packages include so your yatra is comfortable from start to finish.',
      author: 'Parth Saarthi Travels',
      tags: ['spiritual', 'yatra', 'rajasthan'],
      status: 'published',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function getBlogs(): Blog[] {
  seed()
  return store.blogs
}

export function getBlog(id: string): Blog | undefined {
  return getBlogs().find((b) => b._id === id)
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return getBlogs().find((b) => b.slug === slug)
}

export function addBlog(data: Partial<Blog>): Blog {
  seed()
  const now = new Date().toISOString()
  const blog: Blog = {
    _id: 'blog-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: data.title || '',
    slug: data.slug || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    coverImage: data.coverImage,
    author: data.author || '',
    tags: data.tags || [],
    status: data.status || 'draft',
    publishedAt: data.status === 'published' ? now : undefined,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    createdAt: now,
    updatedAt: now,
  }
  store.blogs.unshift(blog)
  return blog
}

export function updateBlog(id: string, data: Partial<Blog>): Blog | undefined {
  const b = getBlog(id)
  if (!b) return undefined
  // Mirrors the DB-mode logic in cms.service.ts: publishedAt is set the
  // first time status flips to 'published', not overwritten on every save.
  if (data.status === 'published' && b.status !== 'published' && !b.publishedAt) {
    data = { ...data, publishedAt: new Date().toISOString() }
  }
  Object.assign(b, data, { updatedAt: new Date().toISOString() })
  return b
}

export function deleteBlog(id: string): boolean {
  seed()
  const idx = store.blogs.findIndex((b) => b._id === id)
  if (idx === -1) return false
  store.blogs.splice(idx, 1)
  return true
}
