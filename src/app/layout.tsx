import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/layout/SmoothScroll'
import PageCurtain from '@/components/layout/PageCurtain'
import Cursor from '@/components/cursor/Cursor'
import Nav from '@/components/nav/Nav'
import Intro from '@/components/intro/Intro'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MERIDIAN — Coastal Architecture Studio',
  description: 'Meridian is a luxury architectural studio specialising in coastal homes. Restrained. Sensory. Deliberate.',
  openGraph: {
    title: 'MERIDIAN',
    description: 'Luxury coastal architecture studio.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Intro />
        <Nav />
        <PageCurtain />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Cursor />
      </body>
    </html>
  )
}
