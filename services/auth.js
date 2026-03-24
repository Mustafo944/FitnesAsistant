import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient()
  // Netlify bir nechta domen ishlatadi (main--, deploy preview).
  // Cookie faqat bitta domenda ishlaydi, shuning uchun doim kanonik URL ishlatamiz.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  const redirectTo = `${siteUrl}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = getSupabaseBrowserClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export function onAuthChange(callback) {
  const supabase = getSupabaseBrowserClient()
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  )
  return subscription
}
