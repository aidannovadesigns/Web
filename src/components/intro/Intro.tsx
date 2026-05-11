'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import s from './Intro.module.css'

export default function Intro() {
  const introRef   = useRef<HTMLDivElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const markRef    = useRef<SVGSVGElement>(null)
  const wordmarkRef = useRef<SVGSVGElement>(null)
  const [phase, setPhase] = useState<'running' | 'exiting' | 'done'>('running')

  useEffect(() => {
    // Skip on repeat visits within same session
    if (sessionStorage.getItem('meridian-intro-seen')) {
      setPhase('done')
      window.dispatchEvent(new Event('meridian:intro-complete'))
      return
    }

    const mark = markRef.current
    const wm   = wordmarkRef.current
    if (!mark || !wm) return

    // Prepare stroke-draw animation on all strokes
    const strokes = Array.from(
      mark.querySelectorAll<SVGGeometryElement>('line, rect, polyline, path')
    )

    strokes.forEach((el) => {
      try {
        const len = el.getTotalLength?.() ?? 200
        el.style.strokeDasharray  = `${len}`
        el.style.strokeDashoffset = `${len}`
      } catch { /* rect doesn't always have getTotalLength */ }
    })

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('meridian-intro-seen', '1')
        window.dispatchEvent(new Event('meridian:intro-complete'))
      },
    })

    // 1. Draw each stroke sequentially — frame then M strokes
    tl.to(strokes, {
      strokeDashoffset: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.inOut',
    }, 0.3)

    // 2. Wordmark fades in beneath
    tl.to(wm, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    }, '-=0.2')

    // 3. Hold — let it breathe
    tl.to({}, { duration: 0.8 })

    // 4. Background transitions from black to brand off-white
    tl.to(bgRef.current, {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.inOut',
    })

    // 5. Mark and wordmark scale down and fade slightly as they "lock to nav"
    tl.to([mark, wm], {
      opacity: 0,
      scale: 0.7,
      duration: 0.5,
      ease: 'cubic-bezier(0.77, 0, 0.175, 1)',
    }, '-=0.3')

    // 6. Full intro overlay fades out
    tl.to(introRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power1.inOut',
      onStart: () => setPhase('exiting'),
      onComplete: () => setPhase('done'),
    })

    return () => { tl.kill() }
  }, [])

  function skip() {
    gsap.killTweensOf('*')
    sessionStorage.setItem('meridian-intro-seen', '1')
    window.dispatchEvent(new Event('meridian:intro-complete'))
    setPhase('done')
  }

  if (phase === 'done') return null

  return (
    <>
      <div
        ref={introRef}
        className={`${s.intro} ${phase === 'exiting' ? s.exiting : ''}`}
        aria-hidden
      >
        <div className={s.markWrap}>
          {/* Frame monogram — strokes animate on */}
          <svg
            ref={markRef}
            className={s.mark}
            viewBox="0 0 100 100"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <rect x="4" y="4" width="92" height="92" stroke="currentColor" strokeWidth="2.5"/>
            <g stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.35">
              <line x1="4"    y1="35.3" x2="96"   y2="35.3"/>
              <line x1="4"    y1="50"   x2="96"   y2="50"/>
              <line x1="4"    y1="64.7" x2="96"   y2="64.7"/>
              <line x1="35.3" y1="4"    x2="35.3" y2="96"/>
              <line x1="50"   y1="4"    x2="50"   y2="96"/>
              <line x1="64.7" y1="4"    x2="64.7" y2="96"/>
            </g>
            <g stroke="currentColor" strokeWidth="4">
              <line x1="20" y1="82" x2="20" y2="18"/>
              <line x1="20" y1="18" x2="50" y2="54"/>
              <line x1="80" y1="18" x2="50" y2="54"/>
              <line x1="80" y1="18" x2="80" y2="82"/>
            </g>
          </svg>

          {/* Wordmark */}
          <svg
            ref={wordmarkRef}
            className={s.wordmark}
            viewBox="0 0 556 100"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-label="Meridian"
          >
            <g stroke="currentColor" strokeWidth="3.8">
              <polyline points="2,98 2,2 34,52 66,2 66,98"/>
              <line x1="90" y1="2"  x2="90"  y2="98"/><line x1="90" y1="2"  x2="146" y2="2"/><line x1="90" y1="50" x2="138" y2="50"/><line x1="90" y1="98" x2="146" y2="98"/>
              <line x1="170" y1="2" x2="170" y2="98"/><path d="M 170,2 H 204 Q 230,2 230,28 Q 230,54 204,54 H 170"/><line x1="202" y1="54" x2="232" y2="98"/>
              <line x1="260" y1="2" x2="260" y2="98"/>
              <line x1="284" y1="2" x2="284" y2="98"/><path d="M 284,2 H 310 Q 342,2 342,50 Q 342,98 310,98 H 284"/>
              <line x1="370" y1="2" x2="370" y2="98"/>
              <polyline points="394,98 424,2 454,98"/><line x1="405" y1="66" x2="443" y2="66"/>
              <polyline points="478,2 478,98 536,2 536,98"/>
            </g>
          </svg>
        </div>
      </div>

      {/* bg fade layer — sits behind intro overlay, reveals the page beneath */}
      <div ref={bgRef} className={s.bgFade} aria-hidden />

      <button className={s.skip} onClick={skip} aria-label="Skip intro">
        Skip
      </button>
    </>
  )
}
