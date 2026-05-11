'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Props {
  sectionRef: React.RefObject<HTMLElement>
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function remap(v: number, a: number, b: number, c: number, d: number) {
  return lerp(c, d, clamp((v - a) / (b - a), 0, 1))
}
function ease(t: number) { return t * t * (3 - 2 * t) }
function easeOut(t: number) { t = 1 - t; return 1 - t * t * t }

const SKY: [number, string][] = [
  [0.00, '#06070B'],
  [0.15, '#0B1020'],
  [0.28, '#16102A'],
  [0.42, '#451808'],
  [0.56, '#904018'],
  [0.68, '#5A8498'],
  [0.82, '#7BA8BC'],
  [1.00, '#94BECE'],
]

function lerpSky(p: number): THREE.Color {
  let i = 0
  while (i < SKY.length - 2 && SKY[i + 1][0] <= p) i++
  const t = ease(clamp((p - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]), 0, 1))
  return new THREE.Color().lerpColors(new THREE.Color(SKY[i][1]), new THREE.Color(SKY[i + 1][1]), t)
}

// Building pieces with batched assembly timing
// bLo/bHi = progress window when this piece assembles (flies to position)
type Piece = {
  w: number; h: number; d: number
  ax: number; ay: number; az: number  // assembled position
  ex: number; ey: number; ez: number  // exploded offset (added to assembled)
  mat: 'wall' | 'mid' | 'glass' | 'slate'
  bLo: number; bHi: number            // batch assembly window
}

const PIECES: Piece[] = [
  // ── BATCH A: Foundation (p 0.10–0.30) ──────────────────────────────────
  { w:5.4,  h:0.10, d:3.4,  ax: 0.0,  ay:-0.65, az: 0.0,  ex: 0.3,  ey:-3.0, ez: 0.2,  mat:'wall',  bLo:0.10, bHi:0.28 },
  { w:3.4,  h:0.80, d:2.4,  ax: 0.2,  ay:-0.18, az: 0.0,  ex: 0.0,  ey:-2.2, ez: 0.0,  mat:'wall',  bLo:0.13, bHi:0.31 },
  { w:1.5,  h:0.06, d:2.0,  ax: 1.58, ay:-0.23, az: 0.1,  ex: 2.8,  ey:-1.6, ez: 0.5,  mat:'wall',  bLo:0.11, bHi:0.29 },
  { w:0.10, h:0.45, d:1.6,  ax: 2.38, ay:-0.43, az: 0.2,  ex: 3.2,  ey:-1.8, ez: 0.5,  mat:'slate', bLo:0.12, bHi:0.30 },

  // ── BATCH B: Structure walls (p 0.27–0.50) ─────────────────────────────
  { w:1.7,  h:1.30, d:1.9,  ax:-0.8,  ay: 0.27, az:-0.1,  ex:-2.0,  ey:-1.4, ez:-0.5, mat:'mid',   bLo:0.27, bHi:0.46 },
  { w:0.13, h:2.10, d:0.80, ax:-1.88, ay: 0.38, az:-0.15, ex:-3.0,  ey: 1.8, ez:-0.5, mat:'slate', bLo:0.29, bHi:0.48 },
  // Interior floor line (thin slab inside main body)
  { w:3.2,  h:0.04, d:2.2,  ax: 0.2,  ay: 0.22, az: 0.0,  ex: 0.0,  ey:-1.0, ez: 0.0,  mat:'mid',   bLo:0.28, bHi:0.47 },

  // ── BATCH C: Envelope & details (p 0.42–0.62) ──────────────────────────
  { w:2.7,  h:0.07, d:2.5,  ax: 0.1,  ay: 0.90, az: 0.0,  ex: 0.5,  ey: 3.2, ez: 0.0,  mat:'wall',  bLo:0.42, bHi:0.60 },
  { w:1.4,  h:1.10, d:0.06, ax: 0.4,  ay: 0.16, az: 1.23, ex: 0.0,  ey:-0.5, ez: 2.8,  mat:'glass', bLo:0.44, bHi:0.62 },
  // Glass infill (upper wing side)
  { w:1.5,  h:1.20, d:0.06, ax:-0.8,  ay: 0.24, az: 0.82, ex:-0.5,  ey:-0.5, ez: 2.5,  mat:'glass', bLo:0.46, bHi:0.63 },
  // Roof parapet front
  { w:2.8,  h:0.12, d:0.08, ax: 0.1,  ay: 0.94, az: 1.27, ex: 0.0,  ey: 3.5, ez: 2.0,  mat:'wall',  bLo:0.43, bHi:0.61 },
]

// Annotation labels: shown when building is assembled, positioned in world space
// Annotation window sits in the gap between stage 2 (ends ~0.51) and stage 3 (starts ~0.74)
const ANNOTATIONS = [
  { title: 'Slate Screen',   sub: 'Pembrokeshire bluestone', wx:-1.88, wy: 0.9,  wz:-0.15, dx: 60, dy:-22, lo:0.52, hi:0.73 },
  { title: 'Cast Roof Slab', sub: 'In-situ board-formed concrete', wx: 0.1,  wy: 0.96, wz: 0.8,  dx: 44, dy:-44, lo:0.54, hi:0.73 },
  { title: 'Glazed Facade',  sub: 'Low-E triple-glazed unit',      wx: 0.4,  wy: 0.5,  wz: 1.30, dx: 52, dy:  2, lo:0.56, hi:0.73 },
  { title: 'Iroko Terrace',  sub: '18m² cantilevered deck',        wx: 1.85, wy:-0.19, wz: 0.6,  dx: 46, dy: 16, lo:0.53, hi:0.73 },
]

export default function ScrollHeroCanvas({ sectionRef }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const wrapRef     = useRef<HTMLDivElement>(null)
  const labelRefs   = useRef<(HTMLDivElement | null)[]>([])
  const lineSvgRef  = useRef<SVGSVGElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95

    // ── Scene + Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.set(4.0, 6.0, 4.0)
    camera.lookAt(0, 0, 0)
    scene.fog = new THREE.Fog(new THREE.Color('#06070B'), 5, 14)

    // ── Lights ────────────────────────────────────────────────────────────
    const ambient    = new THREE.AmbientLight('#3A4A60', 0.20)
    const moonLight  = new THREE.DirectionalLight('#8899BB', 0.14)
    moonLight.position.set(-3, 8, 1)
    const dawnLight  = new THREE.DirectionalLight('#FFA876', 0)
    dawnLight.position.set(5, 1.5, 3)
    dawnLight.castShadow = true
    dawnLight.shadow.mapSize.setScalar(1024)
    dawnLight.shadow.camera.near = 0.5
    dawnLight.shadow.camera.far  = 20
    dawnLight.shadow.camera.left = dawnLight.shadow.camera.bottom = -5
    dawnLight.shadow.camera.right = dawnLight.shadow.camera.top   = 5
    const noonLight  = new THREE.DirectionalLight('#E8EEF2', 0)
    noonLight.position.set(0.5, 8, 2)
    const hemi = new THREE.HemisphereLight('#B8C8D4', '#D6D0C8', 0)
    scene.add(ambient, moonLight, dawnLight, noonLight, hemi)

    // ── Materials ─────────────────────────────────────────────────────────
    const mats = {
      wall:  new THREE.MeshStandardMaterial({ color: '#E8E4DD', roughness: 0.88, metalness: 0, transparent: true, opacity: 0 }),
      mid:   new THREE.MeshStandardMaterial({ color: '#CAC6BF', roughness: 0.80, metalness: 0, transparent: true, opacity: 0 }),
      glass: new THREE.MeshStandardMaterial({ color: '#3A5A6A', roughness: 0.08, metalness: 0.18, transparent: true, opacity: 0 }),
      slate: new THREE.MeshStandardMaterial({ color: '#2D4A5A', roughness: 0.62, metalness: 0.05, transparent: true, opacity: 0 }),
    }
    const wireMat = new THREE.LineBasicMaterial({ color: '#8899BB', transparent: true, opacity: 0.38 })

    // ── Build meshes + wireframes ─────────────────────────────────────────
    const group     = new THREE.Group()
    const meshes:      THREE.Mesh[]         = []
    const wireframes:  THREE.LineSegments[] = []

    PIECES.forEach(p => {
      const geo   = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh  = new THREE.Mesh(geo, mats[p.mat])
      mesh.position.set(p.ax + p.ex, p.ay + p.ey, p.az + p.ez)
      mesh.castShadow    = p.mat !== 'glass'
      mesh.receiveShadow = p.mat !== 'glass'
      group.add(mesh)
      meshes.push(mesh)

      const wf = new THREE.LineSegments(new THREE.EdgesGeometry(geo), wireMat)
      wf.position.copy(mesh.position)
      group.add(wf)
      wireframes.push(wf)
    })
    scene.add(group)

    // Shadow catcher
    const shadowGround = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.12 }))
    shadowGround.rotation.x = -Math.PI / 2
    shadowGround.position.y = -0.72
    shadowGround.receiveShadow = true
    scene.add(shadowGround)

    // ── Scroll state ──────────────────────────────────────────────────────
    const raw = { p: 0 }
    let smoothed = 0

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) { raw.p = self.progress },
    })

    // ── Render + update loop ──────────────────────────────────────────────
    let rafId: number
    const startTime = performance.now()
    const scrPos = new THREE.Vector3()

    function tick() {
      rafId = requestAnimationFrame(tick)
      const elapsed = (performance.now() - startTime) / 1000
      smoothed += (raw.p - smoothed) * 0.055
      const p = smoothed

      // ── Piece assembly ──────────────────────────────────────────────────
      PIECES.forEach((piece, i) => {
        const t = ease(clamp((p - piece.bLo) / (piece.bHi - piece.bLo), 0, 1))
        meshes[i].position.set(
          piece.ax + piece.ex * (1 - t),
          piece.ay + piece.ey * (1 - t),
          piece.az + piece.ez * (1 - t),
        )
        wireframes[i].position.copy(meshes[i].position)
      })

      // ── Wireframe → Solid transition ────────────────────────────────────
      // Wireframes visible at p=0, fade as solids emerge from p=0.08 onwards
      wireMat.opacity = easeOut(clamp(1 - remap(p, 0.08, 0.42, 0, 1), 0, 1)) * 0.40
      const solidity  = easeOut(clamp(remap(p, 0.12, 0.48, 0, 1), 0, 1))
      mats.wall.opacity  = solidity
      mats.mid.opacity   = solidity * 0.95
      mats.slate.opacity = solidity
      // Glass fades in at full opacity during its batch, then settles to 0.48
      mats.glass.opacity = solidity * 0.48

      // ── Group post-assembly rotation ────────────────────────────────────
      const idleBreathe = p < 0.02
      const rot   = ease(clamp((p - 0.62) / 0.38, 0, 1))
      group.rotation.y = rot * -0.45 + (idleBreathe ? Math.sin(elapsed * 0.18) * 0.025 : 0)
      group.rotation.x = rot *  0.04 + (idleBreathe ? Math.sin(elapsed * 0.12) * 0.008 : 0)

      // ── Camera path ─────────────────────────────────────────────────────
      // Three phases:
      // 0.0 → 0.62: aerial (4,6,4) → mid (3.5,2.5,5.5)
      // 0.62 → 0.82: mid → eye-level slight top (3.8,1.8,5.8)
      // 0.82 → 1.0:  settle down (3.8,1.3,5.8) then zoom slight
      const ph1 = ease(clamp(p / 0.62, 0, 1))
      const ph2 = ease(clamp((p - 0.62) / 0.20, 0, 1))
      const ph3 = ease(clamp((p - 0.82) / 0.18, 0, 1))

      camera.position.x = lerp(lerp(lerp(4.0, 3.5, ph1), 3.8, ph2), 3.6, ph3)
      camera.position.y = lerp(lerp(lerp(6.0, 2.5, ph1), 1.8, ph2), 1.3, ph3)
      camera.position.z = lerp(lerp(lerp(4.0, 5.5, ph1), 5.8, ph2), 5.4, ph3)
      const lookY = lerp(lerp(0.0, 0.2, ph1), 0.2, ph2) - p * 0.05
      camera.lookAt(0, lookY, 0)

      // ── Lighting ────────────────────────────────────────────────────────
      ambient.intensity    = remap(p, 0, 0.35, 0.20, 0.32)
      moonLight.intensity  = remap(p, 0, 0.22, 0.14, 0)
      dawnLight.intensity  = remap(p, 0.22, 0.58, 0, 2.2) * (1 - remap(p, 0.65, 1.0, 0, 0.5))
      noonLight.intensity  = remap(p, 0.55, 1.00, 0, 2.6)
      hemi.intensity       = remap(p, 0.30, 0.80, 0, 0.58)

      // ── Sky + Fog ────────────────────────────────────────────────────────
      const sky = lerpSky(p)
      renderer.setClearColor(sky)
      const fog = scene.fog as THREE.Fog
      fog.color.copy(sky)
      fog.near = lerp(5, 22, ease(clamp(p * 1.4, 0, 1)))
      fog.far  = lerp(14, 45, ease(clamp(p * 1.4, 0, 1)))

      renderer.render(scene, camera)

      // ── Annotation label positioning ─────────────────────────────────────
      const cvs = canvasRef.current
      if (!cvs) return
      const W = cvs.offsetWidth
      const H = cvs.offsetHeight
      const svgEl = lineSvgRef.current
      if (svgEl) svgEl.setAttribute('width', String(W))

      ANNOTATIONS.forEach((ann, i) => {
        const el = labelRefs.current[i]
        if (!el) return

        // Fade in over 0.05, hold, fade out over 0.05
        const fadeIn  = ease(clamp((p - ann.lo) / 0.05, 0, 1))
        const fadeOut = ease(clamp((ann.hi - p) / 0.05, 0, 1))
        const op = fadeIn * fadeOut
        el.style.opacity = String(op)

        if (op < 0.01) return

        // World → screen
        scrPos.set(ann.wx, ann.wy, ann.wz)
        // Transform through group rotation
        group.localToWorld(scrPos)
        scrPos.project(camera)

        const sx = (scrPos.x  *  0.5 + 0.5) * W
        const sy = (-scrPos.y * 0.5 + 0.5) * H

        el.style.transform = `translate(${sx + ann.dx}px, ${sy + ann.dy - el.offsetHeight * 0.5}px)`

        // Draw connector line in SVG overlay
        const lineEl = svgEl?.querySelector<SVGLineElement>(`[data-ann="${i}"]`)
        if (lineEl) {
          lineEl.setAttribute('x1', String(sx))
          lineEl.setAttribute('y1', String(sy))
          lineEl.setAttribute('x2', String(sx + ann.dx))
          lineEl.setAttribute('y2', String(sy + ann.dy))
          lineEl.style.opacity = String(op)
        }
      })
    }
    tick()

    // ── Resize ────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      st.kill()
      ro.disconnect()
      renderer.dispose()
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose()
        }
      })
      Object.values(mats).forEach(m => m.dispose())
      wireMat.dispose()
    }
  }, [sectionRef])

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        aria-hidden
      />

      {/* SVG connector lines for annotations */}
      <svg
        ref={lineSvgRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
        height="100%"
        aria-hidden
      >
        {ANNOTATIONS.map((_, i) => (
          <line
            key={i}
            data-ann={i}
            stroke="#F4F1EC"
            strokeWidth="0.5"
            strokeOpacity="0.5"
            style={{ opacity: 0 }}
          />
        ))}
      </svg>

      {/* HTML annotation labels */}
      {ANNOTATIONS.map((ann, i) => (
        <div
          key={i}
          ref={el => { labelRefs.current[i] = el }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            padding: '8px 12px',
            background: 'rgba(6,7,11,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderLeft: '1px solid rgba(244,241,236,0.2)',
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.5625rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              color: '#F4F1EC',
              whiteSpace: 'nowrap',
            }}>
              {ann.title}
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.5rem',
              letterSpacing: '0.08em',
              color: 'rgba(244,241,236,0.45)',
              whiteSpace: 'nowrap',
            }}>
              {ann.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
