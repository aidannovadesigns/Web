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

// Sky gradient keyframes: progress → hex colour
const SKY: [number, string][] = [
  [0.00, '#07080C'],
  [0.18, '#0C1220'],
  [0.30, '#18122A'],
  [0.45, '#4A2010'],
  [0.58, '#8A4018'],
  [0.72, '#6B90A8'],
  [1.00, '#96BCCC'],
]

function lerpSky(p: number): THREE.Color {
  let i = 0
  while (i < SKY.length - 2 && SKY[i + 1][0] <= p) i++
  const [p0, c0] = SKY[i]
  const [p1, c1] = SKY[i + 1]
  const t = ease(clamp((p - p0) / (p1 - p0), 0, 1))
  return new THREE.Color().lerpColors(new THREE.Color(c0), new THREE.Color(c1), t)
}

// Each building piece: assembled position + exploded offset + stagger delay
type Piece = {
  w: number; h: number; d: number
  ax: number; ay: number; az: number
  ex: number; ey: number; ez: number
  mat: 'wall' | 'mid' | 'glass' | 'slate'
  delay: number
}

const PIECES: Piece[] = [
  // base platform — drops from below
  { w:5.4,  h:0.10, d:3.4,  ax: 0.0,  ay:-0.65, az: 0.0,  ex: 0.0,  ey:-2.8, ez: 0.0,  mat:'wall',  delay:0.00 },
  // ground floor — rises from below
  { w:3.4,  h:0.80, d:2.4,  ax: 0.2,  ay:-0.18, az: 0.0,  ex: 0.0,  ey:-2.0, ez: 0.0,  mat:'wall',  delay:0.03 },
  // upper wing — floats left and high
  { w:1.7,  h:1.30, d:1.9,  ax:-0.8,  ay: 0.27, az:-0.1,  ex:-1.2,  ey:-1.2, ez: 0.0,  mat:'mid',   delay:0.06 },
  // glass facade — pushed forward
  { w:1.4,  h:1.10, d:0.06, ax: 0.4,  ay: 0.16, az: 1.23, ex: 0.0,  ey: 0.0, ez: 2.2,  mat:'glass', delay:0.10 },
  // roof slab — descends from high above
  { w:2.7,  h:0.07, d:2.5,  ax: 0.1,  ay: 0.90, az: 0.0,  ex: 0.0,  ey: 2.8, ez: 0.0,  mat:'wall',  delay:0.05 },
  // vertical accent — floats far left and up
  { w:0.13, h:2.10, d:0.80, ax:-1.88, ay: 0.38, az:-0.15, ex:-2.0,  ey: 1.8, ez: 0.0,  mat:'slate', delay:0.09 },
  // east terrace — slides in from right
  { w:1.5,  h:0.06, d:2.0,  ax: 1.58, ay:-0.23, az: 0.1,  ex: 2.5,  ey:-1.4, ez: 0.0,  mat:'wall',  delay:0.02 },
  // garden wall — slides in from right + below
  { w:0.10, h:0.45, d:1.6,  ax: 2.38, ay:-0.43, az: 0.2,  ex: 2.8,  ey:-1.8, ez: 0.0,  mat:'slate', delay:0.13 },
]

export default function ScrollHeroCanvas({ sectionRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const canvas = canvasRef.current
    if (!canvas) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95

    // Scene + camera
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.set(4.0, 6.0, 4.0)
    camera.lookAt(0, 0, 0)

    scene.fog = new THREE.Fog(new THREE.Color('#07080C'), 5, 14)

    // Lights — all start dim (night)
    const ambient    = new THREE.AmbientLight('#3A4A60', 0.18)
    const moonLight  = new THREE.DirectionalLight('#8899AA', 0.12)
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

    // Materials
    const mats = {
      wall:  new THREE.MeshStandardMaterial({ color: '#E8E4DD', roughness: 0.88, metalness: 0 }),
      mid:   new THREE.MeshStandardMaterial({ color: '#CAC6BF', roughness: 0.80, metalness: 0 }),
      glass: new THREE.MeshStandardMaterial({ color: '#3A5A6A', roughness: 0.08, metalness: 0.18, opacity: 0.48, transparent: true }),
      slate: new THREE.MeshStandardMaterial({ color: '#2D4A5A', roughness: 0.62, metalness: 0.05 }),
    }

    // Build meshes from piece definitions
    const group   = new THREE.Group()
    const meshes  = PIECES.map(p => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.d), mats[p.mat])
      mesh.position.set(p.ax + p.ex, p.ay + p.ey, p.az + p.ez)
      mesh.castShadow    = p.mat !== 'glass'
      mesh.receiveShadow = p.mat !== 'glass'
      group.add(mesh)
      return mesh
    })
    scene.add(group)

    // Shadow catcher
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.72
    ground.receiveShadow = true
    scene.add(ground)

    // Scroll state
    const raw = { p: 0 }
    let smoothed = 0

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) { raw.p = self.progress },
    })

    // Render loop
    let rafId: number
    const startTime = performance.now()

    function tick() {
      rafId = requestAnimationFrame(tick)
      const elapsed = (performance.now() - startTime) / 1000

      // Smooth progress — feels like silk
      smoothed += (raw.p - smoothed) * 0.055
      const p = smoothed

      const idleBreath = p < 0.02

      // ── Piece assembly ────────────────────────────────────
      // Assembly happens p 0.10 → 0.65 with per-piece stagger
      PIECES.forEach((piece, i) => {
        const lo = 0.12 + piece.delay
        const hi = 0.58 + piece.delay * 0.6
        const t  = ease(clamp((p - lo) / (hi - lo), 0, 1))
        meshes[i].position.set(
          piece.ax + piece.ex * (1 - t),
          piece.ay + piece.ey * (1 - t),
          piece.az + piece.ez * (1 - t),
        )
      })

      // ── Group rotation (after assembly, follow Hero3D style) ─
      const postT = ease(clamp((p - 0.62) / 0.38, 0, 1))
      const idleY = idleBreath ? Math.sin(elapsed * 0.18) * 0.025 : 0
      const idleX = idleBreath ? Math.sin(elapsed * 0.12) * 0.008 : 0
      group.rotation.y = postT * -0.45 + idleY
      group.rotation.x = postT *  0.04 + idleX

      // ── Camera fly-down from aerial to eye-level ──────────
      // Phase 1 (p 0→0.65): aerial → mid
      const ph1 = ease(clamp(p / 0.65, 0, 1))
      // Phase 2 (p 0.65→1): mid → eye level
      const ph2 = ease(clamp((p - 0.65) / 0.35, 0, 1))

      camera.position.x = lerp(lerp(4.0, 3.5, ph1), 3.8, ph2)
      camera.position.y = lerp(lerp(6.0, 2.5, ph1), 1.3, ph2)
      camera.position.z = lerp(lerp(4.0, 5.5, ph1), 5.8, ph2)

      const lookY = lerp(lerp(0.0, 0.2, ph1), 0.2 - p * 0.1, ph2)
      camera.lookAt(0, lookY, 0)

      // ── Lighting ──────────────────────────────────────────
      ambient.intensity    = remap(p, 0, 0.35, 0.18, 0.30)
      moonLight.intensity  = remap(p, 0, 0.20, 0.12, 0)
      dawnLight.intensity  = remap(p, 0.20, 0.55, 0, 2.0) * (1 - remap(p, 0.65, 1.0, 0, 0.5))
      noonLight.intensity  = remap(p, 0.55, 1.00, 0, 2.4)
      hemi.intensity       = remap(p, 0.30, 0.80, 0, 0.55)

      // ── Sky ───────────────────────────────────────────────
      const sky = lerpSky(p)
      renderer.setClearColor(sky)
      const fog = scene.fog as THREE.Fog
      fog.color.copy(sky)
      fog.near = lerp(5,  20, ease(clamp(p * 1.4, 0, 1)))
      fog.far  = lerp(14, 40, ease(clamp(p * 1.4, 0, 1)))

      renderer.render(scene, camera)
    }
    tick()

    // Resize
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
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const ms = Array.isArray(obj.material) ? obj.material : [obj.material]
          ms.forEach(m => m.dispose())
        }
      })
    }
  }, [sectionRef])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden
    />
  )
}
