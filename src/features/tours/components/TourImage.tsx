'use client'
import { useState } from 'react'
import { categoryMeta, resolveCategory } from '@/config/theme'

// Renders a tour image with a themed gradient + emoji fallback if the
// image is missing or fails to load — so cards never show a broken image.
export default function TourImage({
  src, alt, category, className,
}: { src?: string; alt: string; category?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const meta = categoryMeta[resolveCategory(category)]

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${meta.gradientClass} ${className || ''}`}>
        <span className="text-7xl drop-shadow">{meta.emoji}</span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  )
}
