'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─────────────────────────────────────────────────────────
   Pure Three.js — no R3F. All objects created inside
   useEffect after mount. Safe from SSR and version crashes.
───────────────────────────────────────────────────────── */

interface Props {
  sectionRef: React.RefObject<HTMLElement>
}

export default function Hero3D({ sectionRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    // ── Scene & camera ──────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.set(3.8, 1.3, 5.8)
    camera.lookAt(0, 0.2, 0)

    // ── Lights ──────────────────────────────────────────
    // Dawn: warm low-angle sun from south-west
    const dawnLight = new THREE.DirectionalLight('#FFA876', 2.0)
    dawnLight.position.set(5, 1.5, 3)
    dawnLight.castShadow = true
    dawnLight.shadow.mapSize.setScalar(1024)
    dawnLight.shadow.camera.near = 0.5
    dawnLight.shadow.camera.far  = 20
    dawnLight.shadow.camera.left = dawnLight.shadow.camera.bottom = -5
    dawnLight.shadow.camera.right = dawnLight.shadow.camera.top  =  5
    scene.add(dawnLight)

    // Noon: cool overhead light (starts at 0, fades in on scroll)
    const noonLight = new THREE.DirectionalLight('#E8EEF2', 0)
    noonLight.position.set(0.5, 8, 2)
    noonLight.castShadow = false
    scene.add(noonLight)

    const ambient = new THREE.AmbientLight('#F4F1EC', 0.3)
    scene.add(ambient)

    const hemi = new THREE.HemisphereLight('#B8C8D4', '#D6D0C8', 0.55)
    scene.add(hemi)

    // ── Materials ────────────────────────────────────────
    const matWall = new THREE.MeshStandardMaterial({
      color: '#E8E4DD',
      roughness: 0.88,
      metalness: 0,
    })
    const matMid = new THREE.MeshStandardMaterial({
      color: '#CAC6BF',
      roughness: 0.80,
      metalness: 0,
    })
    const matGlass = new THREE.MeshStandardMaterial({
      color: '#3A5A6A',
      roughness: 0.08,
      metalness: 0.18,
      opacity: 0.48,
      transparent: true,
    })
    const matSlate = new THREE.MeshStandardMaterial({
      color: '#2D4A5A',
      roughness: 0.62,
      metalness: 0.05,
    })
    const matShadow = new THREE.ShadowMaterial({ opacity: 0.12 })

    // ── Building geometry ────────────────────────────────
    const group = new THREE.Group()

    function box(
      w: number, h: number, d: number,
      x: number, y: number, z: number,
      mat: THREE.Material,
      shadow = true,
    ) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      mesh.position.set(x, y, z)
      mesh.castShadow  = shadow
      mesh.receiveShadow = shadow
      group.add(mesh)
    }

    // Base platform (wide, thin)
    box(5.4, 0.10, 3.4,  0.0, -0.65,  0.0, matWall)
    // Ground floor volume
    box(3.4, 0.80, 2.4,  0.2, -0.18,  0.0, matWall)
    // Upper wing (left, slightly taller and deeper)
    box(1.7, 1.30, 1.9, -0.8,  0.27, -0.1, matMid)
    // Glass facade (front-centre — coast-facing glazing)
    box(1.4, 1.10, 0.06, 0.4,  0.16,  1.23, matGlass, false)
    // Cantilevered roof slab
    box(2.7, 0.07, 2.5,  0.1,  0.90,  0.0, matWall)
    // Thin vertical accent slab (west end)
    box(0.13, 2.10, 0.80, -1.88, 0.38, -0.15, matSlate)
    // Terrace / deck (east, cantilevered)
    box(1.5, 0.06, 2.0,  1.58, -0.23,  0.1, matWall)
    // Low garden wall (east, ground level)
    box(0.10, 0.45, 1.6,  2.38, -0.43,  0.2, matSlate)

    scene.add(group)

    // Shadow catcher
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), matShadow)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.72
    ground.receiveShadow = true
    scene.add(ground)

    // ── Subtle idle animation (before scroll starts) ─────
    let idleActive = true

    // ── ScrollTrigger scrub ──────────────────────────────
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.4,
      onUpdate(self) {
        const p = self.progress
        // Model rotates to reveal east/terrace side
        group.rotation.y = p * -0.45
        group.rotation.x = p *  0.04
        // Camera dollies in and descends
        camera.position.z = 5.8 - p * 1.0
        camera.position.y = 1.3 - p * 0.3
        camera.lookAt(0, 0.2 - p * 0.1, 0)
        // Dawn fades, noon rises
        dawnLight.intensity = 2.0 * (1 - p)
        noonLight.intensity = 2.4 * p
        // Slight idle suppression when scrolling
        idleActive = p < 0.02
      },
    })

    // ── Render loop ──────────────────────────────────────
    let rafId: number
    const startTime = performance.now()

    function animate() {
      rafId = requestAnimationFrame(animate)

      if (idleActive) {
        const t = (performance.now() - startTime) / 1000
        // Very subtle breathing rotation when idle
        group.rotation.y = Math.sin(t * 0.18) * 0.025
        group.rotation.x = Math.sin(t * 0.12) * 0.008
      }

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ───────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(canvas)

    // ── Cleanup ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      st.kill()
      ro.disconnect()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m.dispose())
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
