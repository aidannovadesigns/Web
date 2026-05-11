/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/text/RevealText'
import s from './page.module.css'

const FEATURED = {
  title: 'On Building at the Tidal Margin',
  category: 'Essay',
  date: 'March 2024',
  excerpt: 'The relationship between architecture and intertidal geography has been one of the defining questions of our practice. This essay explores what it means to design for a boundary that moves twice daily.',
  img: 'https://picsum.photos/seed/journal-hero/1600/700',
  readTime: '8 min read',
}

const ARTICLES = [
  {
    title: 'Material Memory: Slate on the Welsh Coast',
    category: 'Material',
    date: 'January 2024',
    excerpt: 'Pembrokeshire bluestone has been quarried and laid for centuries. We explore its grain, its colour, and why no other material earns a coastal site the same way.',
    img: 'https://picsum.photos/seed/article-slate/800/600',
    readTime: '5 min',
  },
  {
    title: 'The Cantilever as a Coastal Gesture',
    category: 'Detail',
    date: 'November 2023',
    excerpt: 'A terrace that projects over the sea is not merely structural audacity — it is a declaration of orientation. On the engineering and philosophy of the overhang.',
    img: 'https://picsum.photos/seed/article-cantilever/800/600',
    readTime: '6 min',
  },
  {
    title: 'Site Visits: Three Coastlines in Three Days',
    category: 'Field Notes',
    date: 'September 2023',
    excerpt: 'Pembrokeshire, Connemara, Cape Cod. Same brief, three entirely different answers. Notes from a week of looking at how coastline changes everything.',
    img: 'https://picsum.photos/seed/article-field/800/600',
    readTime: '4 min',
  },
  {
    title: 'Why We Still Draw by Hand',
    category: 'Process',
    date: 'July 2023',
    excerpt: 'Before any CAD model is opened, we draw. Not to produce a deliverable — to think. The relationship between pencil and understanding remains irreplaceable.',
    img: 'https://picsum.photos/seed/article-draw/800/600',
    readTime: '7 min',
  },
  {
    title: 'Low Maintenance ≠ Low Ambition',
    category: 'Essay',
    date: 'May 2023',
    excerpt: 'Coastal buildings face more than any other typology: salt air, storm water, thermal cycling. We explain our approach to materials that age with dignity.',
    img: 'https://picsum.photos/seed/article-maint/800/600',
    readTime: '5 min',
  },
  {
    title: 'The Importance of the Threshold',
    category: 'Detail',
    date: 'March 2023',
    excerpt: 'The moment of entering a house is the moment the architecture makes its first argument. On the door, the canopy, the step, and why they matter more than anything else.',
    img: 'https://picsum.photos/seed/article-thresh/800/600',
    readTime: '6 min',
  },
]

export default function JournalPage() {
  const headerRef  = useRef<HTMLElement>(null)
  const featRef    = useRef<HTMLElement>(null)
  const gridRef    = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const headerEls = headerRef.current?.querySelectorAll('[data-reveal]')
    if (headerEls) {
      gsap.fromTo(Array.from(headerEls),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.14, ease: 'power3.out', delay: 0.2 }
      )
    }

    // Featured image reveal
    const featImg = featRef.current?.querySelector<HTMLElement>(`.${s.featImg}`)
    if (featImg) {
      gsap.fromTo(featImg,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power3.out', delay: 0.3,
          scrollTrigger: { trigger: featRef.current, start: 'top 85%', once: true } }
      )
    }

    const featContent = featRef.current?.querySelector<HTMLElement>(`.${s.featContent}`)
    if (featContent) {
      gsap.fromTo(featContent,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.6,
          scrollTrigger: { trigger: featRef.current, start: 'top 85%', once: true } }
      )
    }

    // Article cards stagger
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(`.${s.articleCard}`)
    cards?.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          delay: (i % 3) * 0.1,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        }
      )
      const img = card.querySelector<HTMLElement>(`.${s.articleImg}`)
      if (img) {
        gsap.fromTo(img,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.0, ease: 'power3.out',
            delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: card, start: 'top 88%', once: true } }
        )
      }
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <main className={s.main}>

      <header ref={headerRef} className={s.header}>
        <span className={s.label} data-reveal>05 — Journal</span>
        <h1 className={s.heading} data-reveal>
          <RevealText trigger="immediate">Notes from</RevealText>
          <br/>
          <RevealText trigger="immediate" delay={0.12}>the practice.</RevealText>
        </h1>
        <p className={s.subhead} data-reveal>
          Essays, field notes, and material studies from fifteen years of coastal building.
        </p>
      </header>

      {/* ── Featured ─────────────────────────────────────────────────── */}
      <section ref={featRef} className={s.featured}>
        <div className={s.featImgWrap}>
          <img src={FEATURED.img} alt={FEATURED.title} className={s.featImg} />
          <div className={s.featOverlay}/>
        </div>
        <div className={s.featContent}>
          <div className={s.featMeta}>
            <span className={s.featCategory}>{FEATURED.category}</span>
            <span className={s.featDot}/>
            <span className={s.featDate}>{FEATURED.date}</span>
            <span className={s.featDot}/>
            <span className={s.featRead}>{FEATURED.readTime}</span>
          </div>
          <h2 className={s.featTitle}>{FEATURED.title}</h2>
          <p className={s.featExcerpt}>{FEATURED.excerpt}</p>
          <Link href="#" className={s.featLink} data-cursor="Read">
            Read essay
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.featArrow}>
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Article grid ─────────────────────────────────────────────── */}
      <section ref={gridRef} className={s.grid}>
        {ARTICLES.map(a => (
          <Link key={a.title} href="#" className={s.articleCard} data-cursor="Read">
            <div className={s.articleImgWrap}>
              <img src={a.img} alt={a.title} className={s.articleImg} />
            </div>
            <div className={s.articleBody}>
              <div className={s.articleMeta}>
                <span className={s.articleCategory}>{a.category}</span>
                <span className={s.articleRead}>{a.readTime}</span>
              </div>
              <h3 className={s.articleTitle}>{a.title}</h3>
              <p className={s.articleExcerpt}>{a.excerpt}</p>
              <span className={s.articleDate}>{a.date}</span>
            </div>
          </Link>
        ))}
      </section>

    </main>
  )
}
