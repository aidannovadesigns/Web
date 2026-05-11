/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import Hero from '@/components/hero/Hero'
import ProcessSection from '@/components/sections/ProcessSection'
import RevealText from '@/components/text/RevealText'
import s from './page.module.css'

const works = [
  { title: 'Tidal House',    location: 'Pembrokeshire', year: '2023', query: 'coastal,architecture,house,minimal' },
  { title: 'The Lookout',    location: 'Connemara',     year: '2022', query: 'cliff,house,ireland,minimal'        },
  { title: 'Dune Residence', location: 'Cape Cod',      year: '2023', query: 'beach,house,modern,sand'           },
  { title: 'Shore Studio',   location: 'Cornwall',      year: '2024', query: 'studio,coastal,concrete,light'     },
]

export default function Home() {
  return (
    <main>

      {/* ── 01 Hero ──────────────────────────────────── */}
      <Hero />

      {/* ── 02 Studio strip ─────────────────────────── */}
      <div className={s.strip}>
        <div>
          <p className={s.stripLabel}>01 — Studio</p>
          <h2 className={s.stripHeading}>
            <RevealText>We design homes that earn their site.</RevealText>
          </h2>
        </div>
        <p className={s.stripBody}>
          Founded in 2010 in Pembrokeshire, Meridian has completed six
          residences on the Atlantic and Irish Sea coasts. We are a small
          practice by choice. Every project is led by the same two
          architects, from the first site visit to the final snagging list.
        </p>
      </div>

      {/* ── 03 Selected Works ────────────────────────── */}
      <section className={s.works}>
        <div className={s.worksHeader}>
          <h2 className={s.worksTitle}>
            <RevealText>Selected Works</RevealText>
          </h2>
          <Link href="/work" className={s.worksAll} data-cursor="View">
            <span className={s.worksAllLine} />
            All projects
          </Link>
        </div>

        <div className={s.grid}>
          {works.map((w) => (
            <Link
              key={w.title}
              href="/work"
              className={s.gridItem}
              data-cursor="View"
            >
              <img
                src={`https://source.unsplash.com/featured/1200x900/?${w.query}`}
                alt={w.title}
                className={s.gridImg}
                loading="lazy"
              />
              <div className={s.gridCaption}>
                <span className={s.gridCaptionTitle}>{w.title}</span>
                <span className={s.gridCaptionMeta}>{w.location} — {w.year}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 04 Process (pinned) ───────────────────────── */}
      <ProcessSection />

      {/* ── 05 Contact CTA ───────────────────────────── */}
      <section className={s.cta}>
        <h2 className={s.ctaHeading}>
          <RevealText>Have a site in mind?</RevealText>
        </h2>
        <Link href="/contact" className={s.ctaLink} data-cursor="Open">
          Start a conversation
        </Link>
      </section>

    </main>
  )
}
