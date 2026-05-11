/* eslint-disable @next/next/no-img-element */
'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/text/RevealText'
import s from './page.module.css'

const VALUES = [
  {
    num: '01',
    title: 'Site first',
    body: 'Every decision — orientation, threshold, material — is tested against the specific conditions of the land. The brief comes second.',
  },
  {
    num: '02',
    title: 'One concept, held rigorously',
    body: 'A single spatial idea, pursued without compromise from first sketch to snagging list. Clarity over complexity.',
  },
  {
    num: '03',
    title: 'Present throughout',
    body: 'Both principals on every project from site visit to handover. No project managers, no junior architects. Always us.',
  },
]

const STATS = [
  { num: '06', label: 'Completed residences' },
  { num: '15', label: 'Years in practice' },
  { num: '03', label: 'Coastlines' },
  { num: '02', label: 'Architects' },
]

export default function StudioPage() {
  const heroRef    = useRef<HTMLElement>(null)
  const quoteRef   = useRef<HTMLElement>(null)
  const statsRef   = useRef<HTMLElement>(null)
  const valuesRef  = useRef<HTMLElement>(null)
  const teamRef    = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Hero entry
    const heroEls = heroRef.current?.querySelectorAll('[data-reveal]')
    if (heroEls) {
      gsap.fromTo(Array.from(heroEls),
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      )
    }

    // Stats counter animation
    const statNums = statsRef.current?.querySelectorAll<HTMLElement>(`.${s.statNum}`)
    statNums?.forEach(el => {
      const target = parseInt(el.textContent || '0', 10)
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = String(Math.round(obj.val)).padStart(2, '0') },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })

    // Values stagger
    const cards = valuesRef.current?.querySelectorAll<HTMLElement>(`.${s.valueCard}`)
    cards?.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: { trigger: card, start: 'top 88%' },
        }
      )
    })

    // Team photos clip reveal
    const portraits = teamRef.current?.querySelectorAll<HTMLElement>(`.${s.portrait}`)
    portraits?.forEach((el, i) => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power3.out',
          delay: i * 0.2,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <main className={s.main}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header ref={heroRef} className={s.hero}>
        <span className={s.label} data-reveal>03 — The Practice</span>
        <h1 className={s.heroHeading} data-reveal>
          <RevealText trigger="immediate">We design homes</RevealText>
          <br />
          <RevealText trigger="immediate" delay={0.12}>that earn their site.</RevealText>
        </h1>
        <p className={s.heroSub} data-reveal>
          Founded in Pembrokeshire in 2010. Six completed residences
          on the Atlantic and Irish Sea coasts.
        </p>
      </header>

      {/* ── Large quote ───────────────────────────────────────────────── */}
      <section ref={quoteRef} className={s.quote}>
        <blockquote className={s.quoteText}>
          <RevealText stagger={0.04}>
            The coast is not a backdrop. It is the brief.
          </RevealText>
        </blockquote>
        <cite className={s.quoteCite}>— Studio founding principle, 2010</cite>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section ref={statsRef} className={s.statsSection}>
        {STATS.map(st => (
          <div key={st.num} className={s.statItem}>
            <span className={s.statNum}>{st.num}</span>
            <span className={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </section>

      {/* ── Story ─────────────────────────────────────────────────────── */}
      <section className={s.story}>
        <div className={s.storyText}>
          <span className={s.storyLabel}>Origin</span>
          <p className={s.storyBody}>
            Meridian was founded after two years working on a remote headland in
            west Wales. Both founders were dissatisfied with how the profession
            treated coastal projects — as an exercise in view maximisation, not
            place-making.
          </p>
          <p className={s.storyBody}>
            Our first project was a 240m² house on a south-facing cliff edge in
            Pembrokeshire. It won a RIBA Award in 2013. Every project since has
            been referred to us by a previous client.
          </p>
          <p className={s.storyBody}>
            We remain a practice of two architects by deliberate choice. Size is
            not a measure of ambition. Precision is.
          </p>
        </div>
        <div className={s.storyImage}>
          <img
            src="https://picsum.photos/seed/studio-story/800/1000"
            alt="Studio at work"
            className={s.storyImg}
          />
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <section ref={valuesRef} className={s.values}>
        <div className={s.valuesHeader}>
          <span className={s.label}>How we work</span>
          <h2 className={s.valuesHeading}>
            <RevealText>Three principles.</RevealText>
          </h2>
        </div>
        <div className={s.valuesGrid}>
          {VALUES.map(v => (
            <div key={v.num} className={s.valueCard}>
              <span className={s.valueNum}>{v.num}</span>
              <h3 className={s.valueTitle}>{v.title}</h3>
              <p className={s.valueBody}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────── */}
      <section ref={teamRef} className={s.team}>
        <div className={s.teamHeader}>
          <span className={s.label}>The architects</span>
          <h2 className={s.teamHeading}>
            <RevealText>Two people. Every project.</RevealText>
          </h2>
        </div>
        <div className={s.teamGrid}>
          {[
            { name: 'Elara Whitmore', role: 'Founding Principal', bio: 'RIBA Part III. Studied at the Bartlett, practiced with Carmody Groarke. Elara leads site strategy and landscape integration on every project.', seed: 'architect-f' },
            { name: 'James Calder',   role: 'Founding Principal', bio: 'RIBA Part III. Studied at Edinburgh, practiced with Snøhetta Oslo. James leads structural coordination and material specification.', seed: 'architect-m' },
          ].map(member => (
            <div key={member.name} className={s.teamMember}>
              <div className={s.portraitWrap}>
                <img
                  src={`https://picsum.photos/seed/${member.seed}/600/700`}
                  alt={member.name}
                  className={s.portrait}
                />
              </div>
              <div className={s.memberInfo}>
                <h3 className={s.memberName}>{member.name}</h3>
                <span className={s.memberRole}>{member.role}</span>
                <p className={s.memberBio}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
