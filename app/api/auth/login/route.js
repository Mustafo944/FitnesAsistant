import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const redirectTo = `${requestUrl.origin}/auth/callback`

  const cookieStore = await cookies()
  
  // Create an explicit response object we can mutate
  const response = new NextResponse(null, { status: 302 })

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
            cookiesToSet.forEach(({ name, value, options }) => {
              // Write directly to the explicit response object!
              response.cookies.set(name, value, options)
            })
          } catch (error) {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${Math.encodeURIComponent(error.message)}`, request.url))
  }

  if (data?.url) {
    response.headers.set('Location', data.url)
    return response
  }

  return NextResponse.redirect(new URL('/?error=UnknownError', request.url))
}
