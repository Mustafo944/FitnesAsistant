import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Asosiy sahifa emas, to'g'ridan-to'g'ri tahlil boshlash uchun dashboard
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
  }

  // Muvaffaqiyatli bo'lsa dashboard'ga
  return NextResponse.redirect(new URL(next, request.url))
}
