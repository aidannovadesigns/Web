'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react'
import s from './page.module.css'

/* ─── Easing motion demos ─────────────────────────────── */
const easings = [
  {
    label: 'Out Expo',
    usage: 'Reveals, content mask-in',
    bezier: 'cubic-bezier(0.16, 1, 0.3, 1)',
    value: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  {
    label: 'In Out Quart',
    usage: 'Page transitions, curtains',
    bezier: 'cubic-bezier(0.77, 0, 0.175, 1)',
    value: 'cubic-bezier(0.77, 0, 0.175, 1)',
  },
  {
    label: 'Out Circ',
    usage: 'Micro-interactions, cursor',
    bezier: 'cubic-bezier(0, 0.55, 0.45, 1)',
    value: 'cubic-bezier(0, 0.55, 0.45, 1)',
  },
  {
    label: 'Linear',
    usage: 'Scroll-scrubbed only',
    bezier: 'linear',
    value: 'linear',
  },
]

const typeScale = [
  {
    label: 'Display 2XL',
    size: 'clamp(4rem, 8vw, 7rem)',
    style: { fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontFamily: 'var(--font-display)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.0, fontVariationSettings: '"opsz" 72, "wght" 200' },
    sample: 'Coastal Form',
    meta: 'Fraunces · 200 · opsz 72',
  },
  {
    label: 'Display XL',
    size: 'clamp(2.75rem, 5.5vw, 4.5rem)',
    style: { fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.05, fontVariationSettings: '"opsz" 48, "wght" 300' },
    sample: 'The Studio',
    meta: 'Fraunces · 300 · opsz 48',
  },
  {
    label: 'Display L',
    size: 'clamp(2rem, 4vw, 3.25rem)',
    style: { fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariationSettings: '"opsz" 36, "wght" 300' },
    sample: 'Architecture for the edge',
    meta: 'Fraunces · 300 · opsz 36',
  },
  {
    label: 'Display M',
    size: '2rem',
    style: { fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: 1.15, fontVariationSettings: '"opsz" 24, "wght" 300' },
    sample: 'Selected works, 2019–2024',
    meta: 'Fraunces · 300 · opsz 24',
  },
  {
    label: 'Body XL',
    size: '1.5rem',
    style: { fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 300, lineHeight: 1.5, fontVariationSettings: '"opsz" 24, "wght" 300, "SOFT" 40' },
    sample: 'We design spaces that earn their view.',
    meta: 'Fraunces · 300 · SOFT 40',
  },
  {
    label: 'Body L',
    size: '1.125rem',
    style: { fontSize: '1.125rem', fontFamily: 'var(--font-sans)', fontWeight: 400, lineHeight: 1.6 },
    sample: 'Every decision — material, threshold, orientation — is made in response to a specific coast, a specific light.',
    meta: 'Inter · 400',
  },
  {
    label: 'Body M',
    size: '1rem',
    style: { fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 400, lineHeight: 1.6, color: 'var(--color-mid)' },
    sample: 'Six completed residences in Pembrokeshire, Connemara, and Cape Cod.',
    meta: 'Inter · 400 · mid tone',
  },
  {
    label: 'Label',
    size: '0.6875rem',
    style: { fontSize: '0.6875rem', fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, lineHeight: 1.4 },
    sample: 'Selected Works — 2024',
    meta: 'Inter · 500 · 0.15em tracking',
  },
]

const colours = [
  { name: 'Background', hex: '#F4F1EC', rgb: '244 241 236', usage: 'Page backgrounds, light surfaces', text: '#1C1C1A' },
  { name: 'Text', hex: '#1C1C1A', rgb: '28 28 26', usage: 'Primary text, headings', text: '#F4F1EC' },
  { name: 'Mid', hex: '#8C8680', rgb: '140 134 128', usage: 'Secondary text, dividers, inactive', text: '#F4F1EC' },
  { name: 'Coastal Slate', hex: '#2D4A5A', rgb: '45 74 90', usage: 'Accent, CTAs, links, hover states', text: '#F4F1EC' },
  { name: 'White', hex: '#FFFFFF', rgb: '255 255 255', usage: 'Reverse text, modal surfaces', text: '#1C1C1A' },
]

const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

/* ─── Motion Demo Component ───────────────────────────── */
function MotionDemo({ easing }: { easing: typeof easings[number] }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<Animation | null>(null)

  function play() {
    if (!dotRef.current || !trackRef.current) return
    const trackWidth = trackRef.current.offsetWidth - 12
    animRef.current?.cancel()
    animRef.current = dotRef.current.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${trackWidth}px)` }],
      { duration: 900, easing: easing.value, fill: 'forwards' }
    )
  }

  return (
    <div
      className={s.motionCard}
      onMouseEnter={play}
      onClick={play}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && play()}
    >
      <div className={s.motionCardLabel}>{easing.label}</div>
      <div className={s.motionCardBezier}>{easing.bezier}</div>
      <div ref={trackRef} className={s.motionTrack}>
        <div ref={dotRef} className={s.motionDot} style={{ position: 'absolute', top: -5 }} />
      </div>
      <div style={{ marginTop: 20, fontSize: '0.75rem', fontFamily: 'var(--font-sans)', color: 'var(--color-mid)' }}>
        {easing.usage} — hover or tap to replay
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────── */
export default function BrandSystem() {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Staggered section reveal on scroll — pure CSS animation, no GSAP dep yet
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      ;(el as HTMLElement).style.opacity = '0'
      ;(el as HTMLElement).style.transform = 'translateY(32px)'
      ;(el as HTMLElement).style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <main className={s.page}>

      {/* ── Header ──────────────────────────────────── */}
      <header className={s.header} ref={headerRef}>
        <p className={s.headerLabel}>Brand System — Internal Reference</p>
        <h1 className={s.headerTitle}>MERIDIAN</h1>
        <p className={s.headerMeta}>Identity System v1.0 · 2024 · Coastal Architecture Studio</p>
      </header>

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className={s.nav}>
        {['Logo', 'Monogram', 'Typography', 'Colour', 'Spacing', 'Voice', 'Motion'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className={s.navItem}>{item}</a>
        ))}
      </nav>

      {/* ── 01 LOGO ─────────────────────────────────── */}
      <section className={s.section} id="logo" data-reveal>
        <p className={s.sectionLabel}>01 — Logo</p>

        <div className={s.logoGrid}>
          {/* Wordmark on light */}
          <div className={s.logoCell} style={{ background: 'var(--color-bg)', border: '1px solid rgba(28,28,26,0.1)', gridColumn: 'span 2' }}>
            <img src="/brand/logo-primary.svg" alt="MERIDIAN wordmark" className={s.logoSvg} style={{ color: '#1C1C1A', maxWidth: 480 }} />
            <span className={s.logoCellLabel}>Primary — on background</span>
          </div>

          {/* Wordmark on dark */}
          <div className={s.logoCell + ' ' + s.logoCellDark}>
            <img src="/brand/logo-primary-dark.svg" alt="MERIDIAN wordmark reversed" className={s.logoSvg} style={{ filter: 'none', maxWidth: 300 }} />
            <span className={s.logoCellLabel}>Reversed — on dark</span>
          </div>

          {/* Wordmark on slate */}
          <div className={s.logoCell + ' ' + s.logoCellSlate}>
            <img src="/brand/logo-primary-dark.svg" alt="MERIDIAN wordmark on slate" className={s.logoSvg} style={{ maxWidth: 300 }} />
            <span className={s.logoCellLabel}>On brand colour</span>
          </div>

          {/* Horizontal lockup */}
          <div className={s.logoCell} style={{ background: 'var(--color-bg)', border: '1px solid rgba(28,28,26,0.1)', gridColumn: 'span 2' }}>
            <img src="/brand/logo-horizontal.svg" alt="MERIDIAN horizontal lockup" className={s.logoSvg} style={{ color: '#1C1C1A', maxWidth: 500 }} />
            <span className={s.logoCellLabel}>Horizontal lockup — mark + wordmark</span>
          </div>

          {/* Stacked lockup */}
          <div className={s.logoCell} style={{ background: 'var(--color-bg)', border: '1px solid rgba(28,28,26,0.1)' }}>
            <img src="/brand/logo-stacked.svg" alt="MERIDIAN stacked lockup" style={{ width: 120, height: 'auto', color: '#1C1C1A' }} />
            <span className={s.logoCellLabel}>Stacked lockup</span>
          </div>
        </div>

        {/* Clear space note */}
        <div data-reveal style={{ marginTop: 48, maxWidth: 640 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--color-mid)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>Minimum size:</strong> 80px wide digital / 25mm print.
            {' '}<strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>Clear space:</strong> equal to the cap-height of the M on all sides.
            Never stretch, rotate, recolour outside the approved palette, or place on a busy photograph without the frame treatment.
          </p>
        </div>
      </section>

      {/* ── 02 MONOGRAM ─────────────────────────────── */}
      <section className={s.section} id="monogram" data-reveal>
        <p className={s.sectionLabel}>02 — Monogram Directions</p>
        <p className={s.sectionTitle}>Three directions — choose one.</p>

        <div className={s.monogramGrid}>
          {/* Direction A */}
          <div className={s.monogramCard}>
            <img
              src="/brand/monogram-a-horizon.svg"
              alt="Monogram Direction A — Horizon"
              className={s.monogramDisplay}
              style={{ color: '#1C1C1A' }}
            />
            <div>
              <div className={s.monogramCardLabel} style={{ marginBottom: 12 }}>A — The Meridian</div>
              <p className={s.monogramCardDesc}>
                The M&apos;s inner valley meets a horizontal line at mid-height. That line is the meridian itself — sky meeting sea. Creates a rectangular window form, references architectural thresholds and horizon views.
              </p>
            </div>
          </div>

          {/* Direction B */}
          <div className={s.monogramCard}>
            <img
              src="/brand/monogram-b-arch.svg"
              alt="Monogram Direction B — Arch"
              className={s.monogramDisplay}
              style={{ color: '#1C1C1A' }}
            />
            <div>
              <div className={s.monogramCardLabel} style={{ marginBottom: 12 }}>B — The Arch</div>
              <p className={s.monogramCardDesc}>
                The inner valley is inverted into a pointed arch. References coastal sea caves, Gothic windows, bridge spans. More organic and historic. The arch negative space is the signature gesture.
              </p>
            </div>
          </div>

          {/* Direction C */}
          <div className={s.monogramCard}>
            <img
              src="/brand/monogram-c-frame.svg"
              alt="Monogram Direction C — Frame"
              className={s.monogramDisplay}
              style={{ color: '#1C1C1A' }}
            />
            <div>
              <div className={s.monogramCardLabel} style={{ marginBottom: 12 }}>C — The Frame</div>
              <p className={s.monogramCardDesc}>
                The M lives inside a thin square frame with a blueprint grid. References architectural drawings, site plans, technical precision. The construction is the concept — honest about its making.
              </p>
            </div>
          </div>
        </div>

        {/* Monogram on dark backgrounds */}
        <div data-reveal style={{ marginTop: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <div style={{ background: '#1C1C1A', padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <img src="/brand/monogram-a-horizon.svg" style={{ width: 80, height: 80, filter: 'invert(1) sepia(1) saturate(0) brightness(10)' }} alt="" />
          </div>
          <div style={{ background: 'var(--color-slate)', padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <img src="/brand/monogram-a-horizon.svg" style={{ width: 80, height: 80, filter: 'invert(1) sepia(1) saturate(0) brightness(10)' }} alt="" />
          </div>
          <div style={{ background: 'var(--color-bg)', padding: '48px', display: 'flex', justifyContent: 'center', border: '1px solid rgba(28,28,26,0.08)' }}>
            <img src="/brand/monogram-a-horizon.svg" style={{ width: 80, height: 80, color: '#1C1C1A' }} alt="" />
          </div>
        </div>
      </section>

      {/* ── 03 TYPOGRAPHY ───────────────────────────── */}
      <section className={s.section} id="typography" data-reveal>
        <p className={s.sectionLabel}>03 — Typography</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: 64, maxWidth: 640 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: 12 }}>Display / Editorial</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, fontVariationSettings: '"opsz" 24' }}>Fraunces</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-mid)', marginTop: 8 }}>Variable — axes: opsz, wght, SOFT, WONK</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: 12 }}>Body / UI</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '2rem', fontWeight: 400 }}>Inter</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-mid)', marginTop: 8 }}>Variable — axes: wght, slnt</p>
          </div>
        </div>

        <div className={s.typeRows}>
          {typeScale.map((row) => (
            <div key={row.label} className={s.typeRow} data-reveal>
              <div className={s.typeRowMeta}>
                {row.label}
                <span>{row.meta}</span>
                <span style={{ marginTop: 2 }}>{row.size}</span>
              </div>
              <div className={s.typeSample} style={row.style}>{row.sample}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 04 COLOUR ───────────────────────────────── */}
      <section className={s.section} id="colour" data-reveal>
        <p className={s.sectionLabel}>04 — Colour</p>

        <div className={s.colourGrid}>
          {colours.map((c) => (
            <div
              key={c.hex}
              className={s.colourSwatch}
              style={{ background: c.hex }}
            >
              <p className={s.colourSwatchName} style={{ color: c.text }}>{c.name}</p>
              <p className={s.colourSwatchHex} style={{ color: c.text }}>{c.hex}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.625rem', color: c.text, opacity: 0.5, marginTop: 4 }}>rgb({c.rgb})</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: c.text, opacity: 0.6, marginTop: 8, lineHeight: 1.4 }}>{c.usage}</p>
            </div>
          ))}
        </div>

        {/* Usage rules */}
        <div data-reveal style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
          {[
            { rule: 'Primary surfaces', text: 'Always Background (#F4F1EC) for page. Never pure white except for modal/overlay surfaces.' },
            { rule: 'Text contrast', text: 'Text on Background: 10.8:1. Coastal Slate on Background: 5.4:1. Mid on Background fails AA — use for decorative only.' },
            { rule: 'Accent use', text: 'Coastal Slate maximum one prominent use per viewport. Not for bulk text, not as background unless dark-mode variation.' },
          ].map((item) => (
            <div key={item.rule}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: 8 }}>{item.rule}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--color-text)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 SPACING ──────────────────────────────── */}
      <section className={s.section} id="spacing" data-reveal>
        <p className={s.sectionLabel}>05 — Spacing</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--color-mid)', marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
          8pt grid. All spacing values are multiples of 8 (with 4 as the minimum unit). Never arbitrary values.
        </p>

        <div className={s.spacingRows}>
          {spacingScale.map((val) => (
            <div key={val} className={s.spacingRow}>
              <div className={s.spacingBar} style={{ width: val }} />
              <span className={s.spacingRowLabel}>{val}px — {val / 8}×</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 06 VOICE ────────────────────────────────── */}
      <section className={s.section} id="voice" data-reveal>
        <p className={s.sectionLabel}>06 — Voice &amp; Tone</p>

        <div className={s.voiceGrid}>
          <div className={s.voiceCard}>
            <p className={s.voiceCardLabel}>Principle</p>
            <p className={s.voiceCardText}>&ldquo;Say more by saying less. The space around a sentence matters as much as the sentence itself.&rdquo;</p>
          </div>
          <div className={s.voiceCard}>
            <p className={s.voiceCardLabel}>Write like this</p>
            <p className={s.voiceCardText} style={{ color: 'var(--color-text)' }}>&ldquo;The tide determines the threshold.&rdquo;</p>
            <p className={s.voiceCardNote}>Sensory. Specific. Confident without boasting. One clean image over three adjectives.</p>
          </div>
          <div className={s.voiceCard}>
            <p className={s.voiceCardLabel}>Not like this</p>
            <p className={s.voiceCardText} style={{ color: 'var(--color-mid)', textDecoration: 'line-through' }}>&ldquo;Our world-class team of award-winning designers creates stunning luxury coastal residences.&rdquo;</p>
            <p className={s.voiceCardNote}>Never: superlatives, agency-speak, self-congratulation, exclamation marks.</p>
          </div>
          <div className={s.voiceCard}>
            <p className={s.voiceCardLabel}>Audience</p>
            <p className={s.voiceCardNote} style={{ fontSize: '0.875rem' }}>
              People who already know what they want. Who have looked at a hundred architects and are looking for one that doesn&apos;t need to persuade them. Speak to their discernment, not their appetite.
            </p>
          </div>
        </div>
      </section>

      {/* ── 07 MOTION ───────────────────────────────── */}
      <section className={s.section} id="motion" data-reveal>
        <p className={s.sectionLabel}>07 — Motion Principles</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--color-mid)', marginBottom: 48, maxWidth: 540, lineHeight: 1.6 }}>
          Motion is editorial, not decorative. Every animation has a reason. Nothing loops, bounces, or draws attention to itself. Hover or tap each card to play.
        </p>

        <div className={s.motionGrid}>
          {easings.map((e) => <MotionDemo key={e.label} easing={e} />)}
        </div>

        {/* Motion principles list */}
        <div data-reveal style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
          {[
            { title: 'Duration', body: '0.3s micro · 0.7s reveal · 1.2s transition. Nothing under 0.3 (rushed), nothing over 1.5 except the intro.' },
            { title: 'Stagger', body: '60–80ms between sibling reveals. Enough to read as sequence, not enough to feel slow.' },
            { title: 'Reduced motion', body: 'All animations degrade to immediate opacity fades. No transforms, no scroll-jacking. prefers-reduced-motion is never an afterthought.' },
            { title: 'Cleanup', body: 'Every GSAP timeline is killed on unmount. Every scroll trigger is reverted. No memory leaks, no stale refs.' },
          ].map((item) => (
            <div key={item.title}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: 8 }}>{item.title}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className={s.footer}>
        <span className={s.footerLabel}>MERIDIAN Brand System — v1.0</span>
        <img src="/brand/monogram.svg" alt="" style={{ width: 32, height: 32, opacity: 0.3 }} />
      </footer>

    </main>
  )
}
