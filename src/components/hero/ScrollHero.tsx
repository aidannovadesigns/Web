'use client'

import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './ScrollHero.module.css'

const ScrollHeroCanvas = dynamic(() => import('./ScrollHeroCanvas'), { ssr: false })

// Progress window for each stage: [in-start, in-end, out-start, out-end]
// All values are 0→1 of total section scroll
const STAGES = [
  { el: 1, fadeIn: [0.00, 0.10], fadeOut: [0.20, 0.28] },
  { el: 2, fadeIn: [0.25, 0.34], fadeOut: [0.52, 0.60] },
  { el: 3, fadeIn: [0.57, 0.65], fadeOut: [0.80, 0.88] },
  { el: 4, fadeIn: [0.85, 0.92], fadeOut: [1.00, 1.00] },
]

// Progress bar widths and which stage is "active"
function stageFromProgress(p: number): number {
  if (p < 0.25) return 0
  if (p < 0.57) return 1
  if (p < 0.85) return 2
  return 3
}

export default function ScrollHero() {
  const sectionRef   = useRef<HTMLElement>(null)
  const stageRefs    = useRef<(HTMLDivElement | null)[]>([])
  const progressRefs = useRef<(HTMLDivElement | null)[]>([])
  const fillRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // For reduced motion: just show stage 1 statically
      if (stageRefs.current[0]) gsap.set(stageRefs.current[0], { opacity: 1 })
      return
    }

    const section = sectionRef.current
    if (!section) return

    // Initialise all stages invisible
    stageRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0 }) })

    // Proxy for smooth scrub
    const proxy = { p: 0 }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate(self) {
        proxy.p = self.progress
        const p = proxy.p

        // Stage opacities
        STAGES.forEach(({ el, fadeIn, fadeOut }, i) => {
          const ref = stageRefs.current[i]
          if (!ref) return
          let opacity = 0
          if (p >= fadeIn[0] && p <= fadeIn[1]) {
            opacity = (p - fadeIn[0]) / (fadeIn[1] - fadeIn[0])
          } else if (p > fadeIn[1] && p < fadeOut[0]) {
            opacity = 1
          } else if (p >= fadeOut[0] && p <= fadeOut[1]) {
            opacity = 1 - (p - fadeOut[0]) / (fadeOut[1] - fadeOut[0])
          }
          ref.style.opacity = String(Math.max(0, Math.min(1, opacity)))
          void el
        })

        // Scroll hint fades out after first stage
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p * 8))
        }

        // Progress track
        const activeStage = stageFromProgress(p)
        progressRefs.current.forEach((el, i) => {
          if (!el) return
          if (i === activeStage) {
            el.classList.add(s['is-active'])
          } else {
            el.classList.remove(s['is-active'])
          }
        })

        // Fill bars
        const stageStarts = [0, 0.25, 0.57, 0.85]
        const stageEnds   = [0.25, 0.57, 0.85, 1.00]
        fillRefs.current.forEach((el, i) => {
          if (!el) return
          const lo = stageStarts[i]
          const hi = stageEnds[i]
          const fill = Math.max(0, Math.min(1, (p - lo) / (hi - lo)))
          el.style.width = `${fill * 100}%`
        })
      },
    })

    // Animate first stage in on load
    gsap.to(stageRefs.current[0], {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.3,
    })

    return () => st.kill()
  }, [])

  return (
    <section ref={sectionRef} className={s.section}>
      <div className={s.sticky}>

        {/* Full-viewport WebGL canvas */}
        <div className={s.canvasWrap}>
          <ScrollHeroCanvas sectionRef={sectionRef as React.RefObject<HTMLElement>} />
        </div>

        {/* ── Stage 1: Brand identity (scroll 0–25%) ──────── */}
        <div
          ref={el => { stageRefs.current[0] = el }}
          className={`${s.stage} ${s.stage1}`}
        >
          <div className={s.stageInner}>
            <span className={s.eyebrow}>Coastal Architecture Studio — Est. 2010</span>
            <div className={s.monogram} aria-hidden>
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
                <rect x="4" y="4" width="92" height="92" strokeWidth="1.5" strokeOpacity="0.4"/>
                <g strokeWidth="0.5" strokeOpacity="0.2">
                  <line x1="4" y1="35.3" x2="96" y2="35.3"/>
                  <line x1="4" y1="50" x2="96" y2="50"/>
                  <line x1="4" y1="64.7" x2="96" y2="64.7"/>
                  <line x1="35.3" y1="4" x2="35.3" y2="96"/>
                  <line x1="50" y1="4" x2="50" y2="96"/>
                  <line x1="64.7" y1="4" x2="64.7" y2="96"/>
                </g>
                <g strokeWidth="3">
                  <line x1="20" y1="82" x2="20" y2="18"/>
                  <line x1="20" y1="18" x2="50" y2="54"/>
                  <line x1="80" y1="18" x2="50" y2="54"/>
                  <line x1="80" y1="18" x2="80" y2="82"/>
                </g>
              </svg>
            </div>
            <h1 className={s.wordmark}>MERIDIAN</h1>
            <p className={s.coords}>52.03°N — 4.69°W — Pembrokeshire</p>
          </div>
        </div>

        {/* ── Stage 2: The statement (scroll 25–57%) ──────── */}
        <div
          ref={el => { stageRefs.current[1] = el }}
          className={`${s.stage} ${s.stage2}`}
        >
          <div className={s.stageInner}>
            <h2 className={s.bigStatement}>
              <span className={s.statLine}>Architecture</span>
              <span className={s.statLine}>for the</span>
              <span className={s.statLineAccent}>edge.</span>
            </h2>
            <p className={s.stageCaption}>
              Where land meets sea, structure meets sky.
            </p>
          </div>
        </div>

        {/* ── Stage 3: Credentials (scroll 57–85%) ────────── */}
        <div
          ref={el => { stageRefs.current[2] = el }}
          className={`${s.stage} ${s.stage3}`}
        >
          <div className={s.stageInner}>
            <div className={s.stats}>
              <div className={s.stat}>
                <span className={s.statNum}>06</span>
                <span className={s.statLabel}>Completed residences</span>
              </div>
              <div className={s.statDivider} />
              <div className={s.stat}>
                <span className={s.statNum}>03</span>
                <span className={s.statLabel}>Atlantic coastlines</span>
              </div>
              <div className={s.statDivider} />
              <div className={s.stat}>
                <span className={s.statNum}>15</span>
                <span className={s.statLabel}>Years building by the sea</span>
              </div>
            </div>
            <p className={s.credential}>
              Every project led start-to-finish by the same two architects.
              No hand-offs. No compromises.
            </p>
          </div>
        </div>

        {/* ── Stage 4: CTA (scroll 85–100%) ───────────────── */}
        <div
          ref={el => { stageRefs.current[3] = el }}
          className={`${s.stage} ${s.stage4}`}
        >
          <div className={s.stageInner}>
            <p className={s.ctaLabel}>Ready to begin?</p>
            <div className={s.ctaGroup}>
              <Link href="/work" className={s.ctaPrimary} data-cursor="View">
                <span className={s.ctaPrimaryInner}>View our work</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.ctaArrow}>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/contact" className={s.ctaSecondary} data-cursor="Open">
                Start a conversation
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className={s.scrollHint} aria-hidden>
          <span className={s.scrollHintLine}/>
          <span className={s.scrollHintLabel}>Scroll to explore</span>
        </div>

        {/* Progress track */}
        <div className={s.progressTrack} aria-hidden>
          {['01','02','03','04'].map((n, i) => (
            <div
              key={n}
              ref={el => { progressRefs.current[i] = el }}
              className={s.progressItem}
            >
              <span className={s.progressNum}>{n}</span>
              <span className={s.progressBar}>
                <span
                  ref={el => { fillRefs.current[i] = el }}
                  className={s.progressFill}
                />
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
