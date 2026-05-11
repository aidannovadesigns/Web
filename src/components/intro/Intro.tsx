'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import s from './Intro.module.css'

// Load R3F canvas client-side only — avoids SSR mismatch
const IntroScene = dynamic(() => import('./IntroScene'), { ssr: false })

export default function Intro() {
  const introRef    = useRef<HTMLDivElement>(null)
  const bgRef       = useRef<HTMLDivElement>(null)
  const markRef     = useRef<SVGSVGElement>(null)
  const wordmarkRef = useRef<SVGSVGElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const sceneOpacity = useRef(1)  // shared with IntroScene via ref
  const [phase, setPhase] = useState<'running' | 'exiting' | 'done'>('running')
  const [labelText, setLabelText] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('meridian-intro-seen')) {
      setPhase('done')
      window.dispatchEvent(new Event('meridian:intro-complete'))
      return
    }

    const mark = markRef.current
    const wm   = wordmarkRef.current
    if (!mark || !wm) return

    // Prepare stroke-draw on every geometric element in the SVG
    const strokes = Array.from(
      mark.querySelectorAll<SVGGeometryElement>('line, rect, polyline, path')
    )
    strokes.forEach((el) => {
      try {
        const len = (el as SVGGeometryElement).getTotalLength?.() ?? 150
        el.style.strokeDasharray  = `${len}`
        el.style.strokeDashoffset = `${len}`
      } catch { /* some elements don't support getTotalLength */ }
    })

    const tl = gsap.timeline({
      onComplete() {
        sessionStorage.setItem('meridian-intro-seen', '1')
        window.dispatchEvent(new Event('meridian:intro-complete'))
      },
    })

    // 0s — progress bar begins
    tl.to(progressRef.current, {
      scaleX: 1,
      duration: 3.0,
      ease: 'power1.inOut',
    }, 0)

    // 0.2s — outer frame rect draws on
    tl.to(strokes.slice(0, 1), {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 0.2)

    // 0.8s — blueprint grid lines draw on (staggered, subtle)
    tl.to(strokes.slice(1, 7), {
      strokeDashoffset: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power1.out',
    }, 0.8)

    // 1.1s — M strokes draw on with deliberate stagger
    tl.to(strokes.slice(7), {
      strokeDashoffset: 0,
      duration: 0.55,
      stagger: 0.10,
      ease: 'power2.inOut',
    }, 1.1)

    // 1.4s — stage label appears
    tl.call(() => {
      setLabelText('— Coastal Architecture Studio')
      if (labelRef.current) labelRef.current.classList.add(s.visible)
    }, [], 1.5)

    // 1.8s — wordmark fades in
    tl.to(wm, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    }, 1.8)

    // 2.6s — hold
    tl.to({}, { duration: 0.6 }, 2.5)

    // 3.1s — bg cross-fades black → off-white
    tl.to(bgRef.current, {
      opacity: 1,
      duration: 1.0,
      ease: 'power2.inOut',
    }, 3.1)

    // 3.4s — 3D scene fades via shared ref (IntroScene reads it on each frame)
    tl.to(sceneOpacity, {
      current: 0,
      duration: 0.8,
      ease: 'power1.inOut',
    }, 3.4)

    // 3.6s — mark and wordmark exit: scale down toward nav
    tl.to([mark, wm], {
      opacity: 0,
      scale: 0.6,
      transformOrigin: 'center center',
      duration: 0.55,
      ease: 'cubic-bezier(0.77, 0, 0.175, 1)',
    }, 3.6)

    // 3.9s — full overlay out
    tl.to(introRef.current, {
      opacity: 0,
      duration: 0.45,
      ease: 'power1.inOut',
      onStart: () => setPhase('exiting'),
      onComplete: () => setPhase('done'),
    }, 3.9)

    return () => { tl.kill() }
  }, [])

  function skip() {
    gsap.killTweensOf('*')
    sceneOpacity.current = 0
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
        {/* 3D canvas — behind everything */}
        <div className={s.canvas}>
          <IntroScene opacityRef={sceneOpacity} />
        </div>

        {/* Architectural coordinate details */}
        <span className={s.coordTL}>51.5°N 4.7°W</span>
        <span className={s.coordBR}>EST. MMX</span>

        {/* Brand mark — SVG stroke animation */}
        <div className={s.markWrap}>
          <svg
            ref={markRef}
            className={s.mark}
            viewBox="0 0 100 100"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <rect x="4" y="4" width="92" height="92"
              stroke="currentColor" strokeWidth="2.5"/>
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
              <line x1="90" y1="2"  x2="90"  y2="98"/>
              <line x1="90" y1="2"  x2="146" y2="2"/>
              <line x1="90" y1="50" x2="138" y2="50"/>
              <line x1="90" y1="98" x2="146" y2="98"/>
              <line x1="170" y1="2" x2="170" y2="98"/>
              <path d="M 170,2 H 204 Q 230,2 230,28 Q 230,54 204,54 H 170"/>
              <line x1="202" y1="54" x2="232" y2="98"/>
              <line x1="260" y1="2" x2="260" y2="98"/>
              <line x1="284" y1="2" x2="284" y2="98"/>
              <path d="M 284,2 H 310 Q 342,2 342,50 Q 342,98 310,98 H 284"/>
              <line x1="370" y1="2" x2="370" y2="98"/>
              <polyline points="394,98 424,2 454,98"/>
              <line x1="405" y1="66" x2="443" y2="66"/>
              <polyline points="478,2 478,98 536,2 536,98"/>
            </g>
          </svg>
        </div>

        {/* Stage label */}
        <span ref={labelRef} className={s.stageLabel}>{labelText}</span>

        {/* Progress line at bottom */}
        <div className={s.progressWrap}>
          <div ref={progressRef} className={s.progressBar} />
        </div>
      </div>

      <div ref={bgRef} className={s.bgFade} aria-hidden />

      <button className={s.skip} onClick={skip} aria-label="Skip intro">
        Skip
      </button>
    </>
  )
}
