export const colors = {
  background: '#F4F1EC',
  text:       '#1C1C1A',
  mid:        '#8C8680',
  slate:      '#2D4A5A',
  white:      '#FFFFFF',
} as const

export const ease = {
  // Weighted entry — used for reveals, content masking in
  outExpo:    'cubic-bezier(0.16, 1, 0.3, 1)',
  // Cinematic — used for page transitions and curtains
  inOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  // Snappy settle — used for cursor, micro-interactions
  outCirc:    'cubic-bezier(0, 0.55, 0.45, 1)',
  // Scroll-scrubbed only — ScrollTrigger drives it
  linear:     'linear',
} as const

export const duration = {
  micro:      0.3,
  reveal:     0.7,
  transition: 1.2,
  intro:      3.5,
} as const

export const spacing = {
  unit: 8, // 8pt grid base
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 320] as const,
} as const

export const type = {
  display2xl: 'clamp(4rem, 8vw, 7rem)',
  displayXl:  'clamp(2.75rem, 5.5vw, 4.5rem)',
  displayL:   'clamp(2rem, 4vw, 3.25rem)',
  displayM:   'clamp(1.5rem, 3vw, 2.25rem)',
  bodyXl:     '1.5rem',
  bodyL:      '1.125rem',
  bodyM:      '1rem',
  label:      '0.6875rem',
} as const
