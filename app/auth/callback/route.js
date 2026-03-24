import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let destination = '/dashboard'

  if (!code) {
    console.error('[Auth Callback] No code in URL')
    return NextResponse.redirect(new URL('/?error=no_code_present', request.url))
  }

  const response = NextResponse.redirect(new URL(destination, origin))

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
              secure: true,
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

  try {
    const user = sessionData?.user || (await supabase.auth.getUser()).data.user
    if (!user) {
       return NextResponse.redirect(new URL(`/?error=no_user_found_after_exchange`, request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.onboarded) {
      destination = '/onboarding'
    }
  } catch (e) {
    console.error('[Auth Callback] Profile check error:', e.message)
  }

  // Mutate the location header while keeping the response cookies
  response.headers.set('location', new URL(destination, origin).toString())
  return response
}
