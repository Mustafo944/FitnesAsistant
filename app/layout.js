import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageTransition from '@/components/layout/PageTransition'
import Providers from './providers'
import PWARegister from '@/components/pwa/PWARegister'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'Fit2 - Fitness AI',
  description: "AI yordamida shaxsiy fitness rejangizni oling",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fit2',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleTouchIcon: '/icons/icon.svg',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#8b5cf6',
  openGraph: {
    title: 'Fit2 - Fitness AI',
    description: "AI yordamida shaxsiy fitness rejangizni oling",
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} relative min-h-screen bg-[#08001a] text-white`}>
        <Providers>
        <PWARegister />
        {/* Full Screen Galaxy Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#08001a]" />
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-600/30 blur-[150px] rounded-full" />
          <div className="absolute bottom-[0%] right-[-10%] w-[80%] h-[80%] bg-blue-600/25 blur-[150px] rounded-full" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-pink-500/20 blur-[110px] rounded-full" />
          <div className="stars absolute inset-0 opacity-40 scale-110" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-24">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <BottomNav />
        </div>
        </Providers>
      </body>
    </html>
  )
}
