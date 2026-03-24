'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = getSupabaseBrowserClient()
      
      // URL dagi code ni olish
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const next = params.get('next') || '/dashboard'

      if (code) {
        // Kodni session ga almashtirish
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Auth error:', error)
          router.push(`/?error=${encodeURIComponent(error.message)}`)
          return
        }

        // Muvaffaqiyatli kirish
        router.push(next)
      } else {
        // Kod yo'q bo'lsa (Error yoki cancel bo'lgan bo'lishi mumkin)
        const error = params.get('error_description') || 'Avtorizatsiya kodi topilmadi'
        router.push(`/?error=${encodeURIComponent(error)}`)
      }
    }

    handleAuth()
  }, [router])

  return (
    <PageWrapper className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Kirish amalga oshirilmoqda...</h2>
        <p className="text-gray-400 text-sm">Iltimos kuting, tizim sizni yo&apos;naltirmoqda.</p>
      </div>
    </PageWrapper>
  )
}
