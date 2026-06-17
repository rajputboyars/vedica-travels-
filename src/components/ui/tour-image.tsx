'use client'
import { useState } from 'react'

// Renders a tour image with a themed gradient + emoji fallback if the
// image is missing or fails to load — so cards never show a broken image.
export default function TourImage({
  src, alt, category, className,
}: { src?: string; alt: string; category?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const isLeisure = category === 'leisure'
  const emoji = isLeisure ? '🏔️' : '🛕'
  const gradient = isLeisure
    ? 'from-sky-400 to-emerald-500'
    : 'from-orange-400 to-amber-500'

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className || ''}`}>
        <span className="text-7xl drop-shadow">{emoji}</span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  )
}
