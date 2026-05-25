import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'ExTaskX',
  description: 'ExTaskX - Daily Task Manager',
}

import { Providers } from '@/components/Providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable} suppressHydrationWarning>
      <body className={prompt.className}>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}