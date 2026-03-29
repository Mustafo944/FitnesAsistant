import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')

  if (errorParam) {
    console.error('Auth error:', errorParam)
    return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component cookie error - ignored
            }
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    let activeUser = user

    if (error) {
      const { data: { user: existingUser } } = await supabase.auth.getUser()
      if (existingUser) {
        activeUser = existingUser
      } else {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(new URL('/?error=session_failed', requestUrl.origin))
      }
    }

    if (activeUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', activeUser.id)
        .single()

      if (!profile?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
