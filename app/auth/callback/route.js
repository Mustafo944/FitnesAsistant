import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    console.error('[Auth Callback] No code in URL:', request.url)
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  // We need ONE mutable response object to attach all cookies to.
  // Start by assuming we'll go to /dashboard; we'll change destination if needed.
  let destination = '/dashboard'

  const response = NextResponse.redirect(new URL(destination, origin))

  // Netlify orqasidagi haqiqiy protokolni aniqlash
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const isProduction = process.env.NODE_ENV === 'production' || origin.includes('netlify.app')
  const finalProtocol = forwardedProto || (origin.startsWith('https') ? 'https' : 'http')
  const secureCookie = finalProtocol === 'https' || isProduction

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              secure: secureCookie,
              sameSite: 'lax',
              path: '/',
            }
            request.cookies.set(name, value)
            response.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(
      new URL(`/?error=exchange_code_failed&details=${encodeURIComponent(error.message)}`, request.url)
    )
  }

  // Determine where to send the user
  try {
    const user = sessionData?.user || (await supabase.auth.getUser()).data.user

    if (!user) {
       return NextResponse.redirect(new URL(`/?error=no_user_found_after_exchange`, request.url))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[Auth Callback] profile fetch error:', profileError)
      // Biz profilni topa olmasak ham dashboard ga o'tkazvoramiz (xato bilan loop ga tushmasligi u-n)
      // Yoki onboarding ga jo'natamiz.
      destination = '/onboarding'
    } else if (!profile?.onboarded) {
      destination = '/onboarding'
    }
  } catch (e) {
    console.error('[Auth Callback] try-catch error:', e.message)
    return NextResponse.redirect(new URL(`/?error=fatal_try_catch&details=${encodeURIComponent(e.message)}`, request.url))
  }

  // Mutate the redirect URL on the existing response so cookies are preserved
  response.headers.set('location', new URL(destination, origin).toString())

  return response
}
