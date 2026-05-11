'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function PageCurtain() {
  const ref     = useRef<HTMLDivElement>(null)
  const isFirst = useRef(true)

  const pathname = usePathname()

  useEffect(() => {
    // Skip the very first mount (direct URL load / initial render)
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const el = ref.current
    if (!el) return

    // Curtain sweeps down from top, covers screen, continues off bottom
    gsap.timeline()
      .set(el, { yPercent: -102, visibility: 'visible' })
      .to(el, { yPercent: 0,    duration: 0.52, ease: 'power3.inOut' })
      .to(el, { yPercent: 102,  duration: 0.52, ease: 'power3.inOut', delay: 0.08 })
      .set(el, { visibility: 'hidden' })
  }, [pathname])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: '#2D4A5A',
        visibility: 'hidden',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  )
}
