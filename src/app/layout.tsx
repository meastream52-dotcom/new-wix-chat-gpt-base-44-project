import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintForge — Custom 3D Printing',
  description: 'Custom 3D printed parts, fast. Discontinued, overpriced, or one-of-a-kind — we print it.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}
