import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Casino — Play Money',
  description: 'Provably fair play-money casino. Coins have no real value.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="neon">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
