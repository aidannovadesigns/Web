'use client'

import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './ScrollHero.module.css'

const ScrollHeroCanvas = dynamic(() => import('./ScrollHeroCanvas'), { ssr: false })

// Stage visibility windows — [fadeIn start, fadeIn end, fadeOut start, fadeOut end]
const STAGES = [
  [0.00, 0.08, 0.18, 0.26],  // 1: Brand / night sky + wireframe exploded
  [0.24, 0.32, 0.50, 0.58],  // 2: "Architecture for the edge" (assembly begins)
  [0.56, 0.63, 0.78, 0.86],  // 3: Stats — golden hour, building complete
  [0.84, 0.91, 1.00, 1.00],  // 4: CTA — coastal morning
]

function stageOp(p: number, s: number[]): number {
  if (p < s[0] || p > s[3]) return 0
  if (p <= s[1]) return (p - s[0]) / (s[1] - s[0])
  if (p <= s[2]) return 1
  return 1 - (p - s[2]) / (s[3] - s[2])
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

    stageRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }))

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function revealStage1() {
      const el = stageRefs.current[0]
      if (!el) return
      if (reduced) { gsap.set(el, { opacity: 1 }); return }
      gsap.to(el, { opacity: 1, duration: 1.1, ease: 'power2.out', delay: 0.15 })
    }

    if (sessionStorage.getItem('meridian-intro-seen')) {
      revealStage1()
    } else {
      window.addEventListener('meridian:intro-complete', revealStage1, { once: true })
    }

    if (reduced) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        const p = self.progress

        stageRefs.current.forEach((el, i) => {
          if (!el) return
          if (i === 0 && p < 0.02) return  // keep stage 1 at its GSAP-set opacity while idle
          el.style.opacity = String(stageOp(p, STAGES[i]))
        })

        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p * 10))
        }

        const starts = [0, 0.24, 0.56, 0.84]
        const ends   = [0.24, 0.56, 0.84, 1.00]
        progressItems.current.forEach((el, i) => {
          if (!el) return
          el.classList.toggle(s['is-active'], p >= starts[i] && p < ends[i])
        })
        progressFills.current.forEach((el, i) => {
          if (!el) return
          const f = Math.max(0, Math.min(1, (p - starts[i]) / (ends[i] - starts[i])))
          el.style.width = `${f * 100}%`
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

        {/* ── Stage 1: Night sky — building fragments floating as wireframes */}
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

        {/* ── Stage 2: Foundation assembles, dawn rises — the statement */}
        <div ref={el => { stageRefs.current[1] = el }} className={`${s.stage} ${s.stage2}`}>
          <div className={s.stageInner}>
            <h2 className={s.bigStatement}>
              <span className={s.statLine}>Architecture</span>
              <span className={s.statLine}>for the</span>
              <span className={s.statLineAccent}>edge.</span>
            </h2>
            <p className={s.stageCaption}>Where land meets sea,<br />structure meets sky.</p>
          </div>
        </div>

        {/* ── Stage 3: Full building golden hour — credentials */}
        <div ref={el => { stageRefs.current[2] = el }} className={`${s.stage} ${s.stage3}`}>
          <div className={s.stageInner}>
            <p className={s.stage3Label}>The Practice</p>
            <div className={s.stats}>
              <div className={s.stat}>
                <span className={s.statNum}>06</span>
                <span className={s.statLabel}>Completed<br />residences</span>
              </div>
              <div className={s.statDivider} />
              <div className={s.stat}>
                <span className={s.statNum}>03</span>
                <span className={s.statLabel}>Atlantic<br />coastlines</span>
              </div>
              <div className={s.statDivider} />
              <div className={s.stat}>
                <span className={s.statNum}>15</span>
                <span className={s.statLabel}>Years by<br />the sea</span>
              </div>
            </div>
            <p className={s.credential}>
              Every project led start-to-finish by the same two architects.
              No hand-offs. No compromises.
            </p>
          </div>
        </div>

        {/* ── Stage 4: Coastal morning — CTA */}
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
