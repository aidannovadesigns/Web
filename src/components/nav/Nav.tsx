'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import s from './Nav.module.css'

const links = [
  { href: '/work',    label: 'Work',    cursor: 'View' },
  { href: '/studio',  label: 'Studio',  cursor: 'Read' },
  { href: '/journal', label: 'Journal', cursor: 'Read' },
  { href: '/contact', label: 'Contact', cursor: 'Open' },
]

export default function Nav() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Listen for intro completion signal
    function onIntroComplete() { setVisible(true) }

    window.addEventListener('meridian:intro-complete', onIntroComplete)

    // If intro has already run (repeat visit), show immediately
    if (sessionStorage.getItem('meridian-intro-seen')) {
      setVisible(true)
    }

    return () => window.removeEventListener('meridian:intro-complete', onIntroComplete)
  }, [])

  return (
    <nav className={`${s.nav} ${visible ? s.visible : ''}`} aria-label="Main navigation">
      <Link href="/" className={s.logo} data-cursor="Home">
        {/* Frame monogram inline SVG — no extra request */}
        <svg className={s.logoMark} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
          <rect x="4" y="4" width="92" height="92" strokeWidth="2.5"/>
          <g strokeWidth="0.6" strokeOpacity="0.3">
            <line x1="4"  y1="35.3" x2="96" y2="35.3"/>
            <line x1="4"  y1="50"   x2="96" y2="50"/>
            <line x1="4"  y1="64.7" x2="96" y2="64.7"/>
            <line x1="35.3" y1="4"  x2="35.3" y2="96"/>
            <line x1="50"   y1="4"  x2="50"   y2="96"/>
            <line x1="64.7" y1="4"  x2="64.7" y2="96"/>
          </g>
          <g strokeWidth="4">
            <line x1="20" y1="82" x2="20" y2="18"/>
            <line x1="20" y1="18" x2="50" y2="54"/>
            <line x1="80" y1="18" x2="50" y2="54"/>
            <line x1="80" y1="18" x2="80" y2="82"/>
          </g>
        </svg>
        <svg className={s.logoWordmark} viewBox="0 0 556 100" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="square" strokeLinejoin="miter" aria-label="Meridian">
          <polyline points="2,98 2,2 34,52 66,2 66,98"/>
          <line x1="90" y1="2"  x2="90"  y2="98"/><line x1="90" y1="2"  x2="146" y2="2"/><line x1="90" y1="50" x2="138" y2="50"/><line x1="90" y1="98" x2="146" y2="98"/>
          <line x1="170" y1="2" x2="170" y2="98"/><path d="M 170,2 H 204 Q 230,2 230,28 Q 230,54 204,54 H 170"/><line x1="202" y1="54" x2="232" y2="98"/>
          <line x1="260" y1="2" x2="260" y2="98"/>
          <line x1="284" y1="2" x2="284" y2="98"/><path d="M 284,2 H 310 Q 342,2 342,50 Q 342,98 310,98 H 284"/>
          <line x1="370" y1="2" x2="370" y2="98"/>
          <polyline points="394,98 424,2 454,98"/><line x1="405" y1="66" x2="443" y2="66"/>
          <polyline points="478,2 478,98 536,2 536,98"/>
        </svg>
      </Link>

      <ul className={s.links}>
        {links.map(({ href, label, cursor }) => (
          <li key={href}>
            <Link href={href} className={s.link} data-cursor={cursor}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
