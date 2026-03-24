'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseBrowserClient()
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          // Xatolik bo'lsa bosh sahifaga xabar bilan yo'naltirish
          setTimeout(() => {
            router.replace(`/?error=${encodeURIComponent(error.message)}`)
          }, 2000)
          return
        }
      }

      // Muvaffaqiyatli — dashboard'ga
      router.replace('/dashboard')
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-2">⚠️ Kirishda xatolik:</p>
          <p className="text-red-300 text-xs">{error}</p>
          <p className="text-gray-500 text-xs mt-4">Bosh sahifaga qaytarilmoqda...</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400 font-medium tracking-widest uppercase animate-pulse">
          Kirish tekshirilmoqda...
        </p>
      </div>
    </PageWrapper>
  )
}
