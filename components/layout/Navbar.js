'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { signOut, onAuthChange } from '@/services/auth'

const PROFILE_CACHE_KEY = 'fit2_profile_cache'
const PROFILE_CACHE_TTL = 5 * 60 * 1000 // 5 daqiqa

function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > PROFILE_CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCachedProfile(data) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(() => {
    // SSR-safe: only read localStorage on client
    if (typeof window !== 'undefined') return getCachedProfile()
    return null
  })
  const fetchedRef = useRef(false)

  useEffect(() => {
    const sub = onAuthChange((session) => {
      setUser(session?.user || null)
      if (!session?.user) {
        setProfile(null)
        fetchedRef.current = false
      }
    })
    return () => sub.unsubscribe()
  }, [])

  // Profile fetch — only once per session, cached in localStorage
  useEffect(() => {
    if (!user || fetchedRef.current) return

    // Show cached immediately
    const cached = getCachedProfile()
    if (cached) {
      setProfile(cached)
      fetchedRef.current = true
      return
    }

    fetchedRef.current = true
    fetch('/api/profile', { next: { revalidate: 300 } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setProfile(data)
          setCachedProfile(data)
        }
      })
      .catch(() => {})
  }, [user])

  if (pathname === '/' || pathname === '/onboarding') return null

  const handleSignOut = async () => {
    localStorage.removeItem(PROFILE_CACHE_KEY)
    localStorage.removeItem('fit2_chat_messages')
    await signOut()
    router.push('/')
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.user_metadata?.full_name || 'Foydalanuvchi'

  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <nav className="sticky top-0 z-50 bg-white/[0.03] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border border-white/10 object-cover"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-white hidden sm:block">{displayName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            prefetch={false}
            className={`p-2 rounded-lg transition-colors ${
              pathname === '/settings'
                ? 'text-violet-400 bg-violet-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sozlamalar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Chiqish"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
