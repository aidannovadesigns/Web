'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/text/RevealText'
import s from './Hero.module.css'

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false })

export default function Hero() {
  const sectionRef    = useRef<HTMLElement>(null)
  const bodyRef       = useRef<HTMLParagraphElement>(null)
  const ctaRef        = useRef<HTMLAnchorElement>(null)
  const eyebrowRef    = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Eyebrow + body + CTA stagger in after intro completes
    function onIntroComplete() {
      setReady(true)
      const ctx = gsap.context(() => {
        gsap.to([bodyRef.current, ctaRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          delay: 0.3,
        })
      })
      return () => ctx.revert()
    }

    if (sessionStorage.getItem('meridian-intro-seen')) {
      onIntroComplete()
    } else {
      window.addEventListener('meridian:intro-complete', onIntroComplete, { once: true })
    }

    return () => {
      window.removeEventListener('meridian:intro-complete', onIntroComplete)
    }
  }, [])

  return (
    <section ref={sectionRef} className={s.hero}>
      <div className={s.sticky}>

        {/* 3D canvas — takes up full sticky viewport */}
        <div className={s.canvas}>
          <Hero3D sectionRef={sectionRef as React.RefObject<HTMLElement>} />
        </div>

        {/* Gradient: left side readable, right side shows 3D */}
        <div className={s.canvasGradient} />

        {/* Text overlay */}
        <div className={s.content}>
          <span
            ref={eyebrowRef}
            className={`${s.eyebrow} ${ready ? s.visible : ''}`}
          >
            Coastal Architecture Studio
          </span>

          <h1 className={s.headline}>
            <span className={s.headlineLine}>
              <RevealText trigger={ready ? 'scroll' : 'immediate'} delay={0.5}>
                Architecture
              </RevealText>
            </span>
            <span className={s.headlineLine}>
              <RevealText trigger={ready ? 'scroll' : 'immediate'} delay={0.68}>
                for the edge
              </RevealText>
            </span>
          </h1>

          <p ref={bodyRef} className={s.body} style={{ transform: 'translateY(12px)' }}>
            Six completed residences.<br />
            Three coastlines. One practice.
          </p>

          <Link
            ref={ctaRef}
            href="/work"
            className={s.cta}
            data-cursor="View"
          >
            <span className={s.ctaLine} />
            Selected Works
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={s.scrollIndicator} aria-hidden>
          <div className={s.scrollLine} />
          <span className={s.scrollLabel}>Scroll</span>
        </div>

      </div>
    </section>
  )
}
