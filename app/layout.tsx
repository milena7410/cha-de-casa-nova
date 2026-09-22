import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chá de Casa Nova da Brenda',
  description:
    'Escolha um presente para o chá de casa nova da Brenda, marque como seu e deixe um recadinho carinhoso.',
  generator: 'v0.app',
  openGraph: {
    title: 'Chá de Casa Nova da Brenda',
    description:
      'Escolha um presente, marque como seu e deixe um recadinho pra estrear a casa nova.',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#193959',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
