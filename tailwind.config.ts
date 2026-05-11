import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:    'var(--color-bg)',
        text:  'var(--color-text)',
        mid:   'var(--color-mid)',
        slate: 'var(--color-slate)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans:    'var(--font-sans)',
      },
      spacing: {
        '4':   '4px',
        '8':   '8px',
        '12':  '12px',
        '16':  '16px',
        '24':  '24px',
        '32':  '32px',
        '48':  '48px',
        '64':  '64px',
        '96':  '96px',
        '128': '128px',
        '192': '192px',
        '256': '256px',
      },
      transitionTimingFunction: {
        'out-expo':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'out-circ':     'cubic-bezier(0, 0.55, 0.45, 1)',
      },
      transitionDuration: {
        'micro':      '300ms',
        'reveal':     '700ms',
        'transition': '1200ms',
      },
    },
  },
  plugins: [],
}

export default config
