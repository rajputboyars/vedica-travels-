'use client'
import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react'

// Lightweight scroll-reveal. Wraps content, adds `.in-view` when the
// element scrolls into the viewport so the CSS `.reveal` transition in
// globals.css plays once. Replaces a heavier animation lib with a single
// shared IntersectionObserver-per-node — zero dependencies, respects
// prefers-reduced-motion (handled in CSS).
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  delay?: number
  as?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? 'in-view' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
