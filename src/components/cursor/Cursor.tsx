'use client'

import { useEffect, useRef, useState } from 'react'
import s from './Cursor.module.css'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef  = useRef<HTMLSpanElement>(null)
  const pos       = useRef({ x: 0, y: 0 })
  const current   = useRef({ x: 0, y: 0 })
  const rafRef    = useRef<number>(0)
  const [label, setLabel] = useState('')
  const [active, setActive] = useState(false)

  useEffect(() => {
    // Don't run on touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    function onEnter(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-cursor]') as HTMLElement | null
      if (target) {
        setLabel(target.dataset.cursor || '')
        setActive(true)
      }
    }

    function onLeave(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-cursor]')
      if (target) {
        setLabel('')
        setActive(false)
      }
    }

    function tick() {
      // Lerp toward mouse — 0.12 gives a slightly laggy, weighted follow
      current.current.x += (pos.current.x - current.current.x) * 0.12
      current.current.y += (pos.current.y - current.current.y) * 0.12

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${current.current.x}px, ${current.current.y}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout',  onLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout',  onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className={`${s.cursor} ${active ? s.active : ''}`}
      aria-hidden
    >
      <span ref={labelRef} className={s.label}>{label}</span>
    </div>
  )
}
