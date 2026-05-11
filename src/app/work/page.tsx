/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/text/RevealText'
import s from './page.module.css'

const PROJECTS = [
  { id: '01', title: 'Tidal House',    location: 'Pembrokeshire, Wales',  year: '2023', size: '285m²', type: 'New Build',   img: 'https://picsum.photos/seed/tidal-house/1600/900',    accent: '#A07850' },
  { id: '02', title: 'The Lookout',    location: 'Connemara, Ireland',    year: '2022', size: '310m²', type: 'New Build',   img: 'https://picsum.photos/seed/lookout-ire/1600/900',    accent: '#2D4A5A' },
  { id: '03', title: 'Dune Residence', location: 'Cape Cod, USA',         year: '2023', size: '420m²', type: 'Renovation',  img: 'https://picsum.photos/seed/dune-res-cc/1600/900',    accent: '#7A6248' },
  { id: '04', title: 'Shore Studio',   location: 'Cornwall, England',     year: '2024', size: '180m²', type: 'New Build',   img: 'https://picsum.photos/seed/shore-studio-cn/1600/900',accent: '#4A6A7A' },
  { id: '05', title: 'Bay House',      location: 'Donegal, Ireland',      year: '2021', size: '350m²', type: 'New Build',   img: 'https://picsum.photos/seed/bay-house-don/1600/900',  accent: '#5A4A3A' },
]

export default function WorkPage() {
  const headerRef  = useRef<HTMLElement>(null)
  const galleryRef = useRef<HTMLElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)
  const listRef    = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const headerEls = headerRef.current?.querySelectorAll('[data-reveal]')
    if (headerEls) {
      gsap.fromTo(Array.from(headerEls),
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.14, ease: 'power3.out', delay: 0.2 }
      )
    }

    const mm = gsap.matchMedia()
    mm.add('(min-width: 769px)', () => {
      const track   = trackRef.current
      const gallery = galleryRef.current
      if (!track || !gallery) return

      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - gallery.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: gallery,
          pin: true,
          scrub: 1.6,
          end: () => `+=${track.scrollWidth - gallery.offsetWidth}`,
          invalidateOnRefresh: true,
        },
      })

      track.querySelectorAll<HTMLElement>(`.${s.cardImg}`).forEach(img => {
        gsap.to(img, {
          x: '-10%',
          ease: 'none',
          scrollTrigger: {
            trigger: gallery,
            scrub: 1.6,
            start: 'top top',
            end: () => `+=${track.scrollWidth - gallery.offsetWidth}`,
          },
        })
      })

      return () => tween.kill()
    })

    const rows = listRef.current?.querySelectorAll<HTMLElement>(`.${s.listRow}`)
    rows?.forEach(row => {
      const line = row.querySelector<HTMLElement>(`.${s.listLine}`)
      gsap.fromTo(row, { x: -24, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 92%' },
      })
      if (line) {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1, duration: 0.8, ease: 'power3.out', transformOrigin: 'left',
          scrollTrigger: { trigger: row, start: 'top 92%' },
        })
      }
    })

    return () => { mm.revert(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <main className={s.main}>

      <header ref={headerRef} className={s.header}>
        <span className={s.label} data-reveal>02 — Selected Works</span>
        <h1 className={s.heading} data-reveal>
          <RevealText trigger="immediate">Every project,</RevealText>
          <br />
          <RevealText trigger="immediate" delay={0.14}>earned.</RevealText>
        </h1>
        <div className={s.headerMeta} data-reveal>
          <span>{PROJECTS.length} residences</span>
          <span className={s.metaDot}/>
          <span>Three coastlines</span>
          <span className={s.metaDot}/>
          <span>2010 — present</span>
        </div>
      </header>

      <section ref={galleryRef} className={s.gallery}>
        <div ref={trackRef} className={s.track}>
          {PROJECTS.map((p, i) => (
            <article key={p.id} className={s.card}>
              <div className={s.cardImgWrap}>
                <img src={p.img} alt={p.title} className={s.cardImg} loading={i === 0 ? 'eager' : 'lazy'} />
                <div className={s.cardOverlay} />
              </div>
              <div className={s.cardContent}>
                <span className={s.cardNum}>{p.id}</span>
                <div className={s.cardInfo}>
                  <h2 className={s.cardTitle}>{p.title}</h2>
                  <p className={s.cardLocation}>{p.location}</p>
                  <div className={s.cardMeta}>
                    <span>{p.year}</span>
                    <span className={s.cardDot}/>
                    <span>{p.type}</span>
                    <span className={s.cardDot}/>
                    <span>{p.size}</span>
                  </div>
                </div>
              </div>
              <div className={s.cardAccentLine} style={{ background: p.accent }}/>
            </article>
          ))}
        </div>
        <div className={s.galleryProgress} aria-hidden>
          <span className={s.galleryProgressLabel}>Drag to explore</span>
          <div className={s.galleryProgressBar}/>
        </div>
      </section>

      <section ref={listRef} className={s.list}>
        <div className={s.listHead}>
          <span>No.</span><span>Project</span><span>Location</span><span>Year</span><span>Type</span>
        </div>
        {PROJECTS.map(p => (
          <div key={p.id} className={s.listRow}>
            <div className={s.listLine}/>
            <span className={s.listNum}>{p.id}</span>
            <span className={s.listTitle}>{p.title}</span>
            <span className={s.listLocation}>{p.location}</span>
            <span className={s.listYear}>{p.year}</span>
            <span className={s.listType}>{p.type}</span>
            <span className={s.listArrow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
        ))}
      </section>

      <section className={s.cta}>
        <span className={s.ctaLabel}>Have a site in mind?</span>
        <h2 className={s.ctaHeading}>
          <RevealText>Let&apos;s begin.</RevealText>
        </h2>
        <Link href="/contact" className={s.ctaLink} data-cursor="Open">
          Start a conversation
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.ctaArrow}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </section>

    </main>
  )
}
