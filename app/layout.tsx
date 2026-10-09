import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'NIGHTWALKER ∞ | 無限流 RPG',
  description: '穿越主神空間與怪談世界，以對話、抉擇、解謎及戰鬥改寫命運。',
  applicationName: 'Nightwalker ∞',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/nightwalker-icon.svg' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Nightwalker' }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a111e'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-HK"><body>{children}</body></html>
}
