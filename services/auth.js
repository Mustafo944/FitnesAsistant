import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient()
  // PKCE verifier cookie uchun domen mos kelishi shart.
  // Shuning uchun redirectTo doim hozirgi domenga (origin) yo'naltirishi kerak.
  const redirectTo = `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true, // Avtomatik redirectni to'xtatamiz (race condition oldini olish uchun)
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) throw error

  // Cookie to'liq yozilishi uchun kichik kechikish berib o'zimiz yo'naltiramiz
  if (data?.url) {
    setTimeout(() => {
      window.location.href = data.url
    }, 100)
  }
  
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
