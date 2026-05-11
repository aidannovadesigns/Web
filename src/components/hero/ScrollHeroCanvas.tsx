'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Props {
  sectionRef: React.RefObject<HTMLElement>
}

const VERT = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uProgress;

// Brand palette
#define COL_VOID   vec3(0.039, 0.039, 0.035)
#define COL_NAVY   vec3(0.051, 0.122, 0.176)
#define COL_SLATE  vec3(0.176, 0.290, 0.353)
#define COL_SEA    vec3(0.212, 0.369, 0.431)
#define COL_SAND   vec3(0.769, 0.584, 0.416)
#define COL_GOLD   vec3(0.831, 0.659, 0.325)
#define COL_PAPER  vec3(0.957, 0.945, 0.925)
#define COL_WHITE  vec3(0.980, 0.976, 0.969)

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash2(i),             f);
  float b = dot(hash2(i + vec2(1,0)), f - vec2(1,0));
  float c = dot(hash2(i + vec2(0,1)), f - vec2(0,1));
  float d = dot(hash2(i + vec2(1,1)), f - vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y) * 0.5 + 0.5;
}

float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

// Soft noisy horizontal band
float band(float y, float centre, float w, float noise) {
  float edge = w * 0.5;
  float lo = centre - edge + noise * 0.18;
  float hi = centre + edge + noise * 0.14;
  return smoothstep(lo - 0.04, lo + 0.04, y) *
    (1.0 - smoothstep(hi - 0.04, hi + 0.04, y));
}

// White architecture void that expands in centre
float buildingVoid(vec2 uv, float p) {
  float bw = mix(0.0, 0.55, smoothstep(0.35, 0.90, p));
  float bh = mix(0.0, 0.80, smoothstep(0.35, 0.90, p));
  vec2  d  = abs(uv - vec2(0.50, 0.50)) - vec2(bw * 0.5, bh * 0.5);
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-0.012, 0.012, dist);
}

void main() {
  vec2 uv  = gl_FragCoord.xy / uRes;
  vec2 nuv = uv * vec2(uRes.x / uRes.y, 1.0);

  float p = uProgress;
  float t = uTime;

  float n1 = fbm(nuv * 1.8 + t * 0.025);
  float n2 = fbm(nuv * 3.2 - t * 0.018 + vec2(4.3));
  float n3 = fbm(nuv * 5.6 + t * 0.012 + vec2(8.7, 2.1));

  float y = uv.y;

  // Strata layers
  float lOcean = band(y, mix(0.15, 0.08, p), mix(0.28, 0.18, p), n1 - 0.5);
  float lSlate = band(y, mix(0.42, 0.30, p), mix(0.20, 0.14, p), n2 - 0.5);
  float lSand  = band(y, mix(1.30, 0.52, p), mix(0.18, 0.16, p), n1 - 0.5);
  float lSky   = band(y, mix(0.78, 0.72, p), mix(0.14, 0.26, p), n2 - 0.5);
  float lGlow  = band(y, mix(0.62, 0.58, p), mix(0.06, 0.10, p), n3 - 0.5);

  // Compose colour
  vec3 col = COL_VOID;

  float navyMix  = smoothstep(0.0,  0.15, p);
  col = mix(col, COL_NAVY,  lOcean * navyMix);

  float slateMix = smoothstep(0.10, 0.30, p);
  col = mix(col, COL_SLATE, lSlate * slateMix);

  float seaMix   = smoothstep(0.20, 0.45, p) * (1.0 - smoothstep(0.75, 0.92, p));
  float seaBand  = smoothstep(0.1,  0.9, y + (n1 - 0.5) * 0.25);
  col = mix(col, COL_SEA, seaBand * seaMix * 0.6);

  float sandMix  = smoothstep(0.45, 0.68, p) * (1.0 - smoothstep(0.82, 0.95, p));
  col = mix(col, COL_SAND, lSand * sandMix);

  float glowMix  = smoothstep(0.40, 0.65, p) * (1.0 - smoothstep(0.78, 0.92, p));
  col = mix(col, COL_GOLD, lGlow * glowMix * 1.2);

  float skyMix   = smoothstep(0.70, 0.90, p);
  col = mix(col, COL_PAPER, lSky * skyMix);

  float brighten = smoothstep(0.78, 1.00, p);
  col = mix(col, COL_WHITE, brighten * 0.60);

  // Building void
  float voidMask = buildingVoid(uv, p);
  col = mix(col, COL_PAPER, voidMask);

  // Vignette
  float vigDist   = length((uv - 0.5) * vec2(1.0, 1.2));
  float vig       = smoothstep(0.3, 0.85, vigDist);
  float vigStr    = mix(0.55, 0.18, p);
  col *= 1.0 - vig * vigStr;

  // Film grain
  float grain    = fract(sin(dot(gl_FragCoord.xy + t * 300.0,
                                  vec2(127.1, 311.7))) * 43758.5453) - 0.5;
  float grainStr = mix(0.055, 0.022, p);
  col += grain * grainStr;

  // Chromatic breathe
  float breathe  = sin(t * 0.4 + n1 * 6.28) * 0.003 * (1.0 - p);
  float rShift   = fbm(vec2(nuv.x + breathe, nuv.y) * 1.8 + t * 0.025);
  col.r = mix(col.r, rShift * 0.3, 0.04 * (1.0 - p));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

export default function ScrollHeroCanvas({ sectionRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)

    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const geo = new THREE.BufferGeometry()
    const verts = new Float32Array([-1,-1,0, 3,-1,0, -1,3,0])
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))

    const uniforms = {
      uRes:      { value: new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight) },
      uTime:     { value: 0 },
      uProgress: { value: 0 },
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const proxy = { p: 0 }
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8,
      onUpdate(self) {
        proxy.p = self.progress
      },
    })

    let rafId: number
    const startTime = performance.now()

    function tick() {
      rafId = requestAnimationFrame(tick)
      uniforms.uTime.value      = (performance.now() - startTime) / 1000
      uniforms.uProgress.value += (proxy.p - uniforms.uProgress.value) * 0.06
      renderer.render(scene, camera)
    }
    tick()

    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      renderer.setSize(w, h)
      uniforms.uRes.value.set(w, h)
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      st.kill()
      ro.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
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
