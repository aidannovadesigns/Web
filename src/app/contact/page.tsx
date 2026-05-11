'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/text/RevealText'
import s from './page.module.css'

export default function ContactPage() {
  const mainRef     = useRef<HTMLElement>(null)
  const leftRef     = useRef<HTMLDivElement>(null)
  const rightRef    = useRef<HTMLDivElement>(null)
  const [sent, setSent]   = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const tl = gsap.timeline({ delay: 0.15 })
    tl.fromTo(leftRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
    )
    tl.fromTo(rightRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
      0.2
    )

    return () => { tl.kill() }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    gsap.to(`.${s.form}`, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in', onComplete: () => setSent(true) })
  }

  return (
    <main ref={mainRef} className={s.main}>

      {/* ── Left: form ─────────────────────────────────────────────────── */}
      <div ref={leftRef} className={s.left}>
        <span className={s.label}>04 — Contact</span>

        <h1 className={s.heading}>
          <RevealText trigger="immediate" delay={0.2}>Start a</RevealText>
          <br/>
          <RevealText trigger="immediate" delay={0.34}>conversation.</RevealText>
        </h1>

        <p className={s.intro}>
          Tell us about your site, your brief, and your timeline.
          We&apos;ll respond within two working days.
        </p>

        {sent ? (
          <div className={s.success}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.successIcon}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className={s.successText}>Thank you. We&apos;ll be in touch shortly.</p>
          </div>
        ) : (
          <form className={s.form} onSubmit={handleSubmit} noValidate>
            {[
              { id: 'name',    label: 'Your name',         type: 'text'  },
              { id: 'email',   label: 'Email address',      type: 'email' },
            ].map(({ id, label, type }) => (
              <div
                key={id}
                className={`${s.field} ${active === id ? s.fieldActive : ''}`}
                onFocus={() => setActive(id)}
                onBlur={() => setActive(null)}
              >
                <label htmlFor={id} className={s.fieldLabel}>{label}</label>
                <input id={id} name={id} type={type} className={s.input} required />
                <div className={s.fieldLine}/>
              </div>
            ))}

            <div
              className={`${s.field} ${s.fieldSelect} ${active === 'type' ? s.fieldActive : ''}`}
              onFocus={() => setActive('type')}
              onBlur={() => setActive(null)}
            >
              <label htmlFor="type" className={s.fieldLabel}>Project type</label>
              <select id="type" name="type" className={s.select}>
                <option value="">Select…</option>
                <option>New build residential</option>
                <option>Renovation / extension</option>
                <option>Site appraisal</option>
                <option>Other</option>
              </select>
              <div className={s.fieldLine}/>
            </div>

            <div
              className={`${s.field} ${active === 'message' ? s.fieldActive : ''}`}
              onFocus={() => setActive('message')}
              onBlur={() => setActive(null)}
            >
              <label htmlFor="message" className={s.fieldLabel}>Tell us about your project</label>
              <textarea id="message" name="message" className={s.textarea} rows={5} required />
              <div className={s.fieldLine}/>
            </div>

            <button type="submit" className={s.submit}>
              <span>Send enquiry</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={s.submitArrow}>
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>
        )}
      </div>

      {/* ── Right: studio info ──────────────────────────────────────────── */}
      <div ref={rightRef} className={s.right}>
        <div className={s.infoBlock}>
          <span className={s.infoLabel}>Studio</span>
          <p className={s.infoText}>
            Meridian Architecture<br/>
            The Old Harbour Office<br/>
            Tenby, Pembrokeshire<br/>
            Wales SA70 7HB
          </p>
        </div>

        <div className={s.infoBlock}>
          <span className={s.infoLabel}>Contact</span>
          <p className={s.infoText}>
            <a href="mailto:studio@meridian.arc" className={s.infoLink}>studio@meridian.arc</a><br/>
            <a href="tel:+441834000000" className={s.infoLink}>+44 (0)1834 000 000</a>
          </p>
        </div>

        <div className={s.infoBlock}>
          <span className={s.infoLabel}>Coordinates</span>
          <div className={s.coords}>
            <div className={s.coordRow}>
              <span className={s.coordKey}>LAT</span>
              <span className={s.coordVal}>51.6745°N</span>
            </div>
            <div className={s.coordRow}>
              <span className={s.coordKey}>LON</span>
              <span className={s.coordVal}>4.7022°W</span>
            </div>
            <div className={s.coordRow}>
              <span className={s.coordKey}>ELEV</span>
              <span className={s.coordVal}>12m ASL</span>
            </div>
          </div>
        </div>

        <div className={s.infoBlock}>
          <span className={s.infoLabel}>Studio hours</span>
          <p className={s.infoText}>
            Monday — Friday<br/>
            09:00 — 17:30 GMT
          </p>
        </div>

        <div className={s.decorLine} aria-hidden>
          <svg viewBox="0 0 1 200" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2">
            <line x1="0.5" y1="0" x2="0.5" y2="200"/>
          </svg>
        </div>
      </div>

    </main>
  )
}
