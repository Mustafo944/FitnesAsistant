import { getSupabaseServerClient } from '@/lib/supabase/server'
import DashboardContent from './DashboardContent'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/')
  }

  // Profil ma'lumotlarini serverda olish (Parallel)
  const [profileRes, historyRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  ])

  if (profileRes.error && profileRes.error.code !== 'PGRST116') {
     console.error('Profile fetch error:', profileRes.error)
  }

  if (!profileRes.data) {
    redirect('/onboarding')
  }

  return (
    <DashboardContent 
      initialProfile={profileRes.data} 
      initialLatestAnalysis={historyRes.data} 
    />
  )
}
