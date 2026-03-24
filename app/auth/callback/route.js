import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    console.error('[Auth Callback] No code in URL:', request.url)
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  // Build a redirect response first so we can attach cookies to it
  const redirectUrl = new URL('/dashboard', origin)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies both on request (for this handler) and response (for browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url))
  }

  // Check if user has completed onboarding
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', origin), {
          headers: response.headers,
        })
      }
    }
  } catch (e) {
    console.error('[Auth Callback] profile check error:', e)
  }

  return response
}
