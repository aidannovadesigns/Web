'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── The 3D Frame-monogram form ────────────────────────
   The flat 2D monogram is given architectural depth:
   outer box = building envelope, M strokes = structural
   members, grid planes = blueprint section cuts.
─────────────────────────────────────────────────────── */
function WireformMark({ opacityRef }: { opacityRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)

  // Outer box — the square frame of the monogram becomes a cube
  const outerBox = useMemo(() => {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.72, 1.72, 1.72))
    const mat = new THREE.LineBasicMaterial({ color: '#F4F1EC', transparent: true, opacity: 0.55 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  // Inner box — structural interior reference
  const innerBox = useMemo(() => {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.08, 1.08, 1.08))
    const mat = new THREE.LineBasicMaterial({ color: '#F4F1EC', transparent: true, opacity: 0.12 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  // M strokes — front and back face with depth connectors
  const mStrokes = useMemo(() => {
    const v = [
      // Front face M
      -0.46,  0.56, 0.14,   -0.46, -0.56, 0.14,  // left leg
      -0.46,  0.56, 0.14,    0.00, -0.04, 0.14,   // left diag
       0.46,  0.56, 0.14,    0.00, -0.04, 0.14,   // right diag
       0.46,  0.56, 0.14,    0.46, -0.56, 0.14,   // right leg
      // Back face M (slightly inset)
      -0.40,  0.50, -0.14,  -0.40, -0.50, -0.14,
      -0.40,  0.50, -0.14,   0.00, -0.06, -0.14,
       0.40,  0.50, -0.14,   0.00, -0.06, -0.14,
       0.40,  0.50, -0.14,   0.40, -0.50, -0.14,
      // Depth connectors — top of legs, front→back
      -0.46,  0.56, 0.14,   -0.40,  0.50, -0.14,
       0.46,  0.56, 0.14,    0.40,  0.50, -0.14,
      // Depth connectors — bottom of legs
      -0.46, -0.56, 0.14,   -0.40, -0.50, -0.14,
       0.46, -0.56, 0.14,    0.40, -0.50, -0.14,
    ]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3))
    const mat = new THREE.LineBasicMaterial({ color: '#F4F1EC', transparent: true, opacity: 0.92 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  // Blueprint grid — faint section-cut lines across the Z faces
  const gridLines = useMemo(() => {
    const lines: number[] = []
    const h = 0.86      // half box size
    const d = 0.86      // depth (front face)
    const div = 4       // grid divisions each side

    for (let i = -div; i <= div; i++) {
      const t = i / div
      // Horizontal lines on front face
      lines.push(-h, t * h, d,   h, t * h, d)
      // Vertical lines on front face
      lines.push(t * h, -h, d,   t * h, h, d)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3))
    const mat = new THREE.LineBasicMaterial({ color: '#8C8680', transparent: true, opacity: 0.07 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  // Orbiting accent lines — thin distant structural lines for depth
  const accentLines = useMemo(() => {
    const v = [
      // Horizontal horizon references at various Z depths
      -1.6, 0, -0.9,    1.6,  0, -0.9,
      -1.6, 0.58, -0.3, 1.6,  0.58, -0.3,
      -1.6,-0.58, -0.3, 1.6, -0.58, -0.3,
    ]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3))
    const mat = new THREE.LineBasicMaterial({ color: '#2D4A5A', transparent: true, opacity: 0.45 })
    return new THREE.LineSegments(geo, mat)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    // Architectural rotation — deliberate, not flashy
    groupRef.current.rotation.y = t * 0.22
    groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.08
    // Sync material opacity with intro fade-out
    const op = opacityRef.current
    ;[outerBox, innerBox, mStrokes, gridLines, accentLines].forEach((obj) => {
      if (obj.material instanceof THREE.LineBasicMaterial) {
        obj.material.opacity = obj.material.opacity > 0.5
          ? 0.92 * op
          : (obj.material as THREE.LineBasicMaterial).opacity < 0.1
            ? 0.07 * op
            : obj.material.opacity * op / Math.max(op, 0.001) * op
      }
    })
    // Simpler: just adjust group opacity via individual mats
    outerBox.material.opacity = 0.55 * op
    innerBox.material.opacity = 0.12 * op
    mStrokes.material.opacity = 0.92 * op
    gridLines.material.opacity = 0.07 * op
    accentLines.material.opacity = 0.45 * op
  })

  // Cleanup
  useEffect(() => () => {
    [outerBox, innerBox, mStrokes, gridLines, accentLines].forEach((o) => {
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
    })
  }, [outerBox, innerBox, mStrokes, gridLines, accentLines])

  return (
    <group ref={groupRef}>
      <primitive object={outerBox} />
      <primitive object={innerBox} />
      <primitive object={mStrokes} />
      <primitive object={gridLines} />
      <primitive object={accentLines} />
    </group>
  )
}

/* Camera subtle drift */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.12) * 0.15
    camera.position.y = Math.cos(t * 0.09) * 0.08
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── Exported canvas wrapper ─────────────────────────── */
export default function IntroScene({ opacityRef }: { opacityRef: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <WireformMark opacityRef={opacityRef} />
      <CameraRig />
    </Canvas>
  )
}
