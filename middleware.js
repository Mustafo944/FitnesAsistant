import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Himoyalanmaydigan sahifalar
  const publicPaths = ['/', '/api/auth/callback']
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not use getUser() here if you just want to check session for simple redirect
  // getUser() is more secure but involves a request to Supabase. getSession() is faster.
  const { data: { user } } = await supabase.auth.getUser()

  // Avtorizatsiya tekshirish
  if (!user && !['/', '/auth/callback'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/onboarding', '/upload', '/dashboard', '/history', '/plan', '/plan/diet', '/plan/workout'],
}
