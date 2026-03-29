'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { onAuthChange } from '@/services/auth'

const tabs = [
  {
    href: '/dashboard',
    label: 'Bosh sahifa',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/food',
    label: 'Ovqat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/upload',
    label: 'Tahlil',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/plan',
    label: 'Reja',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const sub = onAuthChange((session) => {
      setUser(session?.user || null)
    })
    return () => sub.unsubscribe()
  }, [])

  // Bosh sahifada, onboarding da va login bo'lmasa ko'rsatmaslik
  if (pathname === '/' || pathname === '/onboarding' || pathname === '/auth/callback' || !user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/[0.03] backdrop-blur-[30px] border-t border-white/10 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-5xl mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`relative ${isActive ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-violet-400' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 w-8 h-0.5 bg-violet-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
