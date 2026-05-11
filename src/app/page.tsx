export default function Home() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: 72 }}>
      {/* Hero placeholder — 3D scene and full homepage built in next phase */}
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'clamp(24px, 6vw, 120px)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 200,
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          fontVariationSettings: '"opsz" 72, "wght" 200',
          maxWidth: '12ch',
        }}>
          Architecture<br/>for the edge
        </h1>
      </div>
    </main>
  )
}
