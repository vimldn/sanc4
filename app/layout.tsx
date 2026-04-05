import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import '@/styles/globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The London Sanctuary — Premium Day-Use Rooms',
    template: '%s | The London Sanctuary',
  },
  description:
    'Book London hotel rooms by the hour for deep work, micro-wellness, and event refresh. Sanctuary Direct pricing — no aggregator commission.',
  metadataBase: new URL('https://london-sanctuary.co.uk'),
  openGraph: {
    siteName: 'The London Sanctuary',
    locale: 'en_GB',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-stone-50 text-stone-800">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
