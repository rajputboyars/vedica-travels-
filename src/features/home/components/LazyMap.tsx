'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

// The Google Maps embed keeps live network connections open, which hurts
// LCP and page-idle. Mount the iframe only once the contact section is
// near the viewport; until then show a lightweight branded placeholder.
export default function LazyMap({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="h-full min-h-[360px] w-full">
      {show ? (
        <iframe
          src={src}
          title="Pickup location map"
          className="w-full h-full min-h-[360px] grayscale contrast-125 opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="grid h-full min-h-[360px] place-items-center bg-ink-800 text-center px-6">
          <div className="flex flex-col items-center gap-3 text-white/60">
            <span className="grid place-items-center w-12 h-12 rounded-full bg-gilt-400/15 text-gilt-300"><MapPin size={22} /></span>
            <span className="text-sm">{label}</span>
          </div>
        </div>
      )}
    </div>
  )
}
