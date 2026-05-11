'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────
   All THREE objects created inside useEffect — this
   guarantees they only run client-side, after mount, with
   a live WebGL context. Never during SSR pre-render.
───────────────────────────────────────────────────────── */
function WireformMark({ opacityRef }: { opacityRef: React.MutableRefObject<number> }) {
  const groupRef    = useRef<THREE.Group>(null)
  const matsRef     = useRef<{ mat: THREE.LineBasicMaterial; base: number }[]>([])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const add = (
      verts: number[] | null,
      boxSize: number | null,
      color: string,
      opacity: number,
    ) => {
      let geo: THREE.BufferGeometry

      if (boxSize !== null) {
        geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(boxSize, boxSize, boxSize))
      } else {
        geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts!), 3))
      }

      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      group.add(new THREE.LineSegments(geo, mat))
      matsRef.current.push({ mat, base: opacity })
    }

    // Outer box — building envelope
    add(null, 1.72, '#F4F1EC', 0.55)
    // Inner box — structural reference
    add(null, 1.08, '#F4F1EC', 0.12)

    // M strokes — front face + back face + depth connectors
    add([
      // Front face
      -0.46,  0.56, 0.14,   -0.46, -0.56, 0.14,
      -0.46,  0.56, 0.14,    0.00, -0.04, 0.14,
       0.46,  0.56, 0.14,    0.00, -0.04, 0.14,
       0.46,  0.56, 0.14,    0.46, -0.56, 0.14,
      // Back face (slightly inset)
      -0.40,  0.50, -0.14,  -0.40, -0.50, -0.14,
      -0.40,  0.50, -0.14,   0.00, -0.06, -0.14,
       0.40,  0.50, -0.14,   0.00, -0.06, -0.14,
       0.40,  0.50, -0.14,   0.40, -0.50, -0.14,
      // Depth connectors
      -0.46,  0.56, 0.14,   -0.40,  0.50, -0.14,
       0.46,  0.56, 0.14,    0.40,  0.50, -0.14,
      -0.46, -0.56, 0.14,   -0.40, -0.50, -0.14,
       0.46, -0.56, 0.14,    0.40, -0.50, -0.14,
    ], null, '#F4F1EC', 0.90)

    // Blueprint grid lines on front face
    const grid: number[] = []
    for (let i = -4; i <= 4; i++) {
      const t = (i / 4) * 0.86
      grid.push(-0.86, t, 0.86,  0.86, t, 0.86)  // horizontal
      grid.push(t, -0.86, 0.86,  t, 0.86, 0.86)  // vertical
    }
    add(grid, null, '#8C8680', 0.07)

    // Accent horizon lines — coastal slate at varying depths
    add([
      -1.6,  0.00, -0.9,   1.6,  0.00, -0.9,
      -1.6,  0.58, -0.3,   1.6,  0.58, -0.3,
      -1.6, -0.58, -0.3,   1.6, -0.58, -0.3,
    ], null, '#2D4A5A', 0.45)

    return () => {
      group.children.forEach((child) => {
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose()
          ;(child.material as THREE.Material).dispose()
        }
      })
      matsRef.current = []
    }
  }, [])

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return

    const t  = clock.elapsedTime
    const op = opacityRef.current

    group.rotation.y = t * 0.22
    group.rotation.x = Math.sin(t * 0.18) * 0.08

    matsRef.current.forEach(({ mat, base }) => {
      mat.opacity = base * op
    })
  })

  return <group ref={groupRef} />
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.12) * 0.15
    camera.position.y = Math.cos(t * 0.09) * 0.08
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function IntroScene({ opacityRef }: { opacityRef: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <WireformMark opacityRef={opacityRef} />
      <CameraRig />
    </Canvas>
  )
}
