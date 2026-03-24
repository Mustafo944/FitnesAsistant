import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  
  // Asosiy domenni olish
  const requestUrl = new URL(request.url)
  const redirectTo = `${requestUrl.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${Math.encodeURIComponent(error.message)}`, request.url))
  }

  // Server-side redirect (HTTP 302). 
  // Next.js Server Client avtomatik ravishda Set-Cookie headerni qo'shadi,
  // PKCE xatosi mutlaqo yo'qoladi, chunki brauzer cookie yozilishini kutishga majbur.
  if (data?.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(new URL('/?error=UnknownError', request.url))
}
