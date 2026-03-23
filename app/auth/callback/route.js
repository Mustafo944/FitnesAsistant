import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth Callback xatolik:', error.message)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url))
    }

    if (!error) {
      // Profil borligini tekshirish
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single()

        // Agar profil bo'lsa va onboarded = true bo'lsa, dashboard ga yo'naltirish
        if (profile?.onboarded) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Xatolik bo'lsa bosh sahifaga qaytarish
  console.log('No code found in params:', request.url)
  return NextResponse.redirect(new URL('/?error=no_code', request.url))
}
