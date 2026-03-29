import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageTransition from '@/components/layout/PageTransition'
import Providers from './providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'Fitness AI Yordamchi',
  description:
    "Sun'iy intellekt yordamida tana holatini tahlil qiling va shaxsiy fitness rejangizni oling",
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className={`${inter.className} relative min-h-screen bg-[#08001a] text-white`}>
        <Providers>
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
