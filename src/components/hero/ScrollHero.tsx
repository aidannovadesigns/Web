'use client'

import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './ScrollHero.module.css'

const ScrollHeroCanvas = dynamic(() => import('./ScrollHeroCanvas'), { ssr: false })

// Each stage: progress range when it's fully visible
const STAGES = [
  { fadeIn: [0.00, 0.10], hold: [0.10, 0.20], fadeOut: [0.20, 0.28] },
  { fadeIn: [0.25, 0.34], hold: [0.34, 0.52], fadeOut: [0.52, 0.60] },
  { fadeIn: [0.57, 0.65], hold: [0.65, 0.80], fadeOut: [0.80, 0.88] },
  { fadeIn: [0.85, 0.92], hold: [0.92, 1.00], fadeOut: [1.00, 1.00] },
]

function stageOpacity(p: number, stage: typeof STAGES[0]): number {
  const { fadeIn, fadeOut } = stage
  if (p < fadeIn[0]) return 0
  if (p <= fadeIn[1]) return (p - fadeIn[0]) / (fadeIn[1] - fadeIn[0])
  if (p < fadeOut[0]) return 1
  if (p <= fadeOut[1]) return 1 - (p - fadeOut[0]) / (fadeOut[1] - fadeOut[0])
  return 0
}

export default function ScrollHero() {
  const sectionRef    = useRef<HTMLElement>(null)
  const stageRefs     = useRef<(HTMLDivElement | null)[]>([])
  const progressItems = useRef<(HTMLDivElement | null)[]>([])
  const progressFills = useRef<(HTMLSpanElement | null)[]>([])
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    if (!section) return

    // All stages invisible until scroll drives them
    stageRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }))

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Stage 1 animates in after intro completes
    function revealStage1() {
      if (isReducedMotion) {
        const el = stageRefs.current[0]
        if (el) gsap.set(el, { opacity: 1 })
        return
      }
      gsap.to(stageRefs.current[0], {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.out',
        delay: 0.1,
      })
    }

    if (sessionStorage.getItem('meridian-intro-seen')) {
      revealStage1()
    } else {
      window.addEventListener('meridian:intro-complete', revealStage1, { once: true })
    }

    if (isReducedMotion) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        const p = self.progress

        // Stage opacities
        stageRefs.current.forEach((el, i) => {
          if (!el) return
          // Stage 1 is handled separately above; once scrolling starts, hand it to the
          // normal scroll-driven opacity calculation
          const op = stageOpacity(p, STAGES[i])
          // For stage 1: only override once we've scrolled past 0.02 (avoid flash)
          if (i === 0 && p < 0.02) return
          el.style.opacity = String(op)
        })

        // Scroll hint fades quickly
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p * 12))
        }

        // Progress track
        const stageStarts = [0, 0.25, 0.57, 0.85]
        const stageEnds   = [0.25, 0.57, 0.85, 1.00]
        progressItems.current.forEach((el, i) => {
          if (!el) return
          const active = p >= stageStarts[i] && p < stageEnds[i]
          el.classList.toggle(s['is-active'], active)
        })
        progressFills.current.forEach((el, i) => {
          if (!el) return
          const fill = Math.max(0, Math.min(1,
            (p - stageStarts[i]) / (stageEnds[i] - stageStarts[i])
          ))
          el.style.width = `${fill * 100}%`
        })
      },
    })

    return () => {
      st.kill()
      window.removeEventListener('meridian:intro-complete', revealStage1)
    }
  }, [])

  return (
    <section ref={sectionRef} className={s.section}>
      <div className={s.sticky}>

        <div className={s.canvasWrap}>
          <ScrollHeroCanvas sectionRef={sectionRef as React.RefObject<HTMLElement>} />
        </div>

        {/* Stage 1 — exploded building in night sky */}
        <div ref={el => { stageRefs.current[0] = el }} className={`${s.stage} ${s.stage1}`}>
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

        {/* Stage 2 — building assembles, dawn rising */}
        <div ref={el => { stageRefs.current[1] = el }} className={`${s.stage} ${s.stage2}`}>
          <div className={s.stageInner}>
            <h2 className={s.bigStatement}>
              <span className={s.statLine}>Architecture</span>
              <span className={s.statLine}>for the</span>
              <span className={s.statLineAccent}>edge.</span>
            </h2>
            <p className={s.stageCaption}>Where land meets sea, structure meets sky.</p>
          </div>
        </div>

        {/* Stage 3 — golden hour, building complete */}
        <div ref={el => { stageRefs.current[2] = el }} className={`${s.stage} ${s.stage3}`}>
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

        {/* Stage 4 — coastal morning, CTA */}
        <div ref={el => { stageRefs.current[3] = el }} className={`${s.stage} ${s.stage4}`}>
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
            <div key={n} ref={el => { progressItems.current[i] = el }} className={s.progressItem}>
              <span className={s.progressNum}>{n}</span>
              <span className={s.progressBar}>
                <span ref={el => { progressFills.current[i] = el }} className={s.progressFill} />
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
