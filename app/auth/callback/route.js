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
            // Ensure cookies are secure in production
            const cookieOptions = {
              ...options,
              secure: origin.startsWith('https') || process.env.NODE_ENV === 'production',
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }

  // Determine where to send the user
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle() // maybeSingle() returns null (not error) when no row found

      if (!profile?.onboarded) {
        destination = '/onboarding'
      }
    }
  } catch (e) {
    console.error('[Auth Callback] profile check error:', e)
  }

  // Mutate the redirect URL on the existing response so cookies are preserved
  response.headers.set('location', new URL(destination, origin).toString())

  return response
}
