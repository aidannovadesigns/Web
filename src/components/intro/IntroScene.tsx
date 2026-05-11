'use client'

import { useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────
   Vanilla Canvas 2D with perspective projection.
   No Three.js, no R3F — nothing that can crash at runtime.
   Produces identical visual to the R3F scene.
───────────────────────────────────────────────────────── */

const CAMERA_DIST = 3.6

type Point3 = [number, number, number]

// Outer box edges — [p1, p2] pairs
const BOX_EDGES: [Point3, Point3][] = [
  // Front face (z = +1)
  [[-1,-1,1],[1,-1,1]], [[1,-1,1],[1,1,1]], [[1,1,1],[-1,1,1]], [[-1,1,1],[-1,-1,1]],
  // Back face (z = -1)
  [[-1,-1,-1],[1,-1,-1]], [[1,-1,-1],[1,1,-1]], [[1,1,-1],[-1,1,-1]], [[-1,1,-1],[-1,-1,-1]],
  // Connectors
  [[-1,-1,1],[-1,-1,-1]], [[1,-1,1],[1,-1,-1]], [[1,1,1],[1,1,-1]], [[-1,1,1],[-1,1,-1]],
]

// Inner box (0.62 scale)
const INNER_BOX_EDGES: [Point3, Point3][] = BOX_EDGES.map(
  ([p1, p2]) => [
    [p1[0]*0.62, p1[1]*0.62, p1[2]*0.62],
    [p2[0]*0.62, p2[1]*0.62, p2[2]*0.62],
  ]
)

// M strokes — front and back face with depth connectors
const M_LINES: [Point3, Point3][] = [
  // Front face
  [[-0.46,  0.56, 1.01], [-0.46, -0.56, 1.01]],
  [[-0.46,  0.56, 1.01], [ 0.00, -0.04, 1.01]],
  [[ 0.46,  0.56, 1.01], [ 0.00, -0.04, 1.01]],
  [[ 0.46,  0.56, 1.01], [ 0.46, -0.56, 1.01]],
  // Back face (inset)
  [[-0.40,  0.50, -1.01], [-0.40, -0.50, -1.01]],
  [[-0.40,  0.50, -1.01], [ 0.00, -0.06, -1.01]],
  [[ 0.40,  0.50, -1.01], [ 0.00, -0.06, -1.01]],
  [[ 0.40,  0.50, -1.01], [ 0.40, -0.50, -1.01]],
  // Depth connectors
  [[-0.46,  0.56, 1.01], [-0.40,  0.50, -1.01]],
  [[ 0.46,  0.56, 1.01], [ 0.40,  0.50, -1.01]],
  [[-0.46, -0.56, 1.01], [-0.40, -0.50, -1.01]],
  [[ 0.46, -0.56, 1.01], [ 0.40, -0.50, -1.01]],
]

// Coastal slate accent / horizon lines
const ACCENT_LINES: [Point3, Point3][] = [
  [[-1.6,  0.00, -0.9], [1.6,  0.00, -0.9]],
  [[-1.6,  0.58, -0.3], [1.6,  0.58, -0.3]],
  [[-1.6, -0.58, -0.3], [1.6, -0.58, -0.3]],
]

export default function IntroScene({
  opacityRef,
}: {
  opacityRef: React.MutableRefObject<number>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number
    const el  = canvas  // captured non-null ref for closures
    const gfx = ctx     // captured non-null ctx for closures

    function setSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      el.width  = el.offsetWidth  * dpr
      el.height = el.offsetHeight * dpr
      gfx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    setSize()
    const ro = new ResizeObserver(setSize)
    ro.observe(el)

    const startTime = performance.now()

    function rotateY(p: Point3, a: number): Point3 {
      return [
        p[0] * Math.cos(a) + p[2] * Math.sin(a),
        p[1],
        -p[0] * Math.sin(a) + p[2] * Math.cos(a),
      ]
    }
    function rotateX(p: Point3, a: number): Point3 {
      return [
        p[0],
        p[1] * Math.cos(a) - p[2] * Math.sin(a),
        p[1] * Math.sin(a) + p[2] * Math.cos(a),
      ]
    }

    function project(p: Point3, cx: number, cy: number, size: number, camX: number, camY: number): [number, number, number] {
      const depth = CAMERA_DIST - p[2]
      if (depth <= 0) return [cx, cy, 0]  // behind camera
      const scale = CAMERA_DIST / depth
      return [
        cx + (p[0] - camX) * scale * size,
        cy + (p[1] - camY) * scale * size,
        scale,
      ]
    }

    function drawLine3(
      p1: Point3, p2: Point3,
      color: string, alpha: number,
      cx: number, cy: number, size: number,
      camX: number, camY: number,
      globalOp: number,
    ) {
      const [sx1, sy1, sc1] = project(p1, cx, cy, size, camX, camY)
      const [sx2, sy2, sc2] = project(p2, cx, cy, size, camX, camY)
      if (sc1 <= 0 || sc2 <= 0) return
      // Depth-based alpha — far edges slightly dimmer
      const depthAlpha = Math.min(((sc1 + sc2) / 2) * 1.4, 1)
      gfx.globalAlpha = alpha * globalOp * depthAlpha
      gfx.strokeStyle = color
      gfx.lineWidth   = 1
      gfx.beginPath()
      gfx.moveTo(sx1, sy1)
      gfx.lineTo(sx2, sy2)
      gfx.stroke()
    }

    function draw() {
      const t   = (performance.now() - startTime) / 1000
      const op  = opacityRef.current
      const w   = el.offsetWidth
      const h   = el.offsetHeight
      const cx  = w / 2
      const cy  = h / 2
      const size = Math.min(cx, cy) * 0.68

      // Rotation angles
      const ry = t * 0.22
      const rx = Math.sin(t * 0.18) * 0.08

      // Camera drift (matches original R3F scene)
      const camX = Math.sin(t * 0.12) * 0.15
      const camY = Math.cos(t * 0.09) * 0.08

      gfx.clearRect(0, 0, w, h)


      function xform(p: Point3): Point3 {
        return rotateX(rotateY(p, ry), rx)
      }

      // Blueprint grid on front face
      for (let i = -4; i <= 4; i++) {
        const v = (i / 4) * 0.86
        drawLine3(xform([-0.86, v, 1]), xform([0.86, v, 1]), '#8C8680', 0.07, cx, cy, size, camX, camY, op)
        drawLine3(xform([v, -0.86, 1]), xform([v, 0.86, 1]), '#8C8680', 0.07, cx, cy, size, camX, camY, op)
      }

      // Accent horizon lines (drawn first — behind everything)
      ACCENT_LINES.forEach(([p1, p2]) => {
        drawLine3(xform(p1), xform(p2), '#2D4A5A', 0.45, cx, cy, size, camX, camY, op)
      })

      // Inner box
      INNER_BOX_EDGES.forEach(([p1, p2]) => {
        drawLine3(xform(p1), xform(p2), '#F4F1EC', 0.12, cx, cy, size, camX, camY, op)
      })

      // Outer box
      BOX_EDGES.forEach(([p1, p2]) => {
        drawLine3(xform(p1), xform(p2), '#F4F1EC', 0.50, cx, cy, size, camX, camY, op)
      })

      // M strokes (brightest, on top)
      M_LINES.forEach(([p1, p2]) => {
        drawLine3(xform(p1), xform(p2), '#F4F1EC', 0.92, cx, cy, size, camX, camY, op)
      })

      gfx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [opacityRef])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
