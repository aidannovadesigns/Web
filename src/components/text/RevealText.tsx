'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './RevealText.module.css'

interface Props {
  children: string
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
  className?: string
  trigger?: 'scroll' | 'immediate'
  stagger?: number
}

export default function RevealText({
  children,
  as: Tag = 'span',
  delay = 0,
  className,
  trigger = 'scroll',
  stagger = 0.07,
}: Props) {
  const containerRef = useRef<HTMLElement>(null)

  const words = children.split(' ').filter(Boolean)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = containerRef.current
    if (!el) return

    const inners = el.querySelectorAll<HTMLElement>(`.${s.inner}`)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inners,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
          stagger,
          delay,
          ...(trigger === 'scroll'
            ? {
                scrollTrigger: {
                  trigger: el,
                  start: 'top 88%',
                  toggleActions: 'play none none none',
                },
              }
            : {}),
        }
      )
    }, el)

    return () => ctx.revert()
  }, [delay, stagger, trigger])

  return (
    // @ts-expect-error — dynamic tag with ref
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={s.word}>
            <span className={s.inner}>{word}</span>
          </span>
          {i < words.length - 1 && <span className={s.space} aria-hidden />}
        </span>
      ))}
    </Tag>
  )
}
