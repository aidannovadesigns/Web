'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './ProcessSection.module.css'

const steps = [
  {
    number: '01',
    title: 'Site & Vision',
    body: 'Every project starts with the land itself. We read the light, the prevailing wind, the high-water line. The brief comes second.',
    iconId: 'icon-process-1',
  },
  {
    number: '02',
    title: 'Design',
    body: 'A single spatial concept, held to rigorously. Threshold, orientation, material — each decision tested against the coast.',
    iconId: 'icon-process-2',
  },
  {
    number: '03',
    title: 'Engineering',
    body: 'Coastal conditions are unforgiving. We work closely with structural and environmental engineers from the first sketch.',
    iconId: 'icon-process-3',
  },
  {
    number: '04',
    title: 'Build',
    body: 'On-site through the full construction. Not directing from an office — present for every threshold, every junction.',
    iconId: 'icon-process-4',
  },
]

export default function ProcessSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const pinnedRef   = useRef<HTMLDivElement>(null)
  const numberRef   = useRef<HTMLSpanElement>(null)
  const stepRefs    = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const pinned  = pinnedRef.current
    if (!section || !pinned) return

    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[]
    if (els.length < 4) return

    // All steps except first start hidden, shifted down
    gsap.set(els.slice(1), { autoAlpha: 0, yPercent: 35 })
    // First step fully visible
    gsap.set(els[0], { autoAlpha: 1, yPercent: 0 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: pinned,
          scrub: 1.5,
          start: 'top top',
          end: '+=280%',
          onUpdate(self) {
            const step = Math.min(Math.floor(self.progress * 4), 3)
            setActiveStep(step)
            if (numberRef.current) {
              numberRef.current.textContent = steps[step].number
            }
          },
        },
      })

      // Transition 1 → 2
      tl.to(els[0], { autoAlpha: 0, yPercent: -35, duration: 0.4, ease: 'power2.in' })
      tl.to(els[1], { autoAlpha: 1, yPercent: 0,   duration: 0.4, ease: 'power2.out' }, '<0.1')
      tl.to({}, { duration: 0.8 })   // hold on step 2

      // Transition 2 → 3
      tl.to(els[1], { autoAlpha: 0, yPercent: -35, duration: 0.4, ease: 'power2.in' })
      tl.to(els[2], { autoAlpha: 1, yPercent: 0,   duration: 0.4, ease: 'power2.out' }, '<0.1')
      tl.to({}, { duration: 0.8 })   // hold on step 3

      // Transition 3 → 4
      tl.to(els[2], { autoAlpha: 0, yPercent: -35, duration: 0.4, ease: 'power2.in' })
      tl.to(els[3], { autoAlpha: 1, yPercent: 0,   duration: 0.4, ease: 'power2.out' }, '<0.1')
      tl.to({}, { duration: 0.8 })   // hold on step 4
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={s.section}>
      {/* Icon sprite — hidden */}
      <svg style={{ display: 'none' }} aria-hidden>
        <symbol id="icon-process-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="16" y2="8"/>
        </symbol>
        <symbol id="icon-process-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="19" x2="21" y2="19"/><polyline points="4,19 4,13 8,13 8,9 12,9 12,6 16,6 16,13 20,13 20,19"/>
        </symbol>
        <symbol id="icon-process-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/>
        </symbol>
        <symbol id="icon-process-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="20" x2="21" y2="20"/><polyline points="6,20 6,11 12,5 18,11 18,20"/><line x1="10" y1="20" x2="10" y2="14"/><line x1="14" y1="20" x2="14" y2="14"/><line x1="10" y1="14" x2="14" y2="14"/>
        </symbol>
      </svg>

      <div ref={pinnedRef} className={s.pinned}>
        <span className={s.sectionLabel}>02 — Process</span>

        {/* Left: large ghost number */}
        <div className={s.left}>
          <p className={s.stepMeta}>How we work</p>
          <span ref={numberRef} className={s.stepNumber}>{steps[0].number}</span>
        </div>

        {/* Right: step content (stacked, GSAP toggles visibility) */}
        <div className={s.right}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => { stepRefs.current[i] = el }}
              className={s.step}
            >
              <svg className={s.stepIcon} aria-hidden>
                <use href={`#${step.iconId}`} />
              </svg>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className={s.progress} aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              ref={(el) => { dotRefs.current[i] = el }}
              className={`${s.dot} ${activeStep === i ? s.active : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
