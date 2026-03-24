'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/Spinner'

import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[Auth Callback] Exchange error:', error.message)
          router.push(`/?error=exchange_error&details=${encodeURIComponent(error.message)}`)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profile?.onboarded) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } else {
        router.push('/')
      }
    }

    handleCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="relative z-10 text-center space-y-6">
      <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <Spinner size="lg" className="text-violet-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Xavfsiz kirish...</h2>
        <p className="text-gray-400 text-sm animate-pulse font-medium">Sizning profilingiz tahlil qilinmoqda</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08001a] relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <Suspense fallback={
        <div className="relative z-10 text-center">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  )
}
