import './globals.css'

export const metadata = {
  title: 'Nightwalker RPG',
  description: 'AI Horror Text RPG'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-HK">
      <body>
        {children}
      </body>
    </html>
  )
}
