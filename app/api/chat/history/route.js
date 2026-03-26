import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }) // Eng eskisidan yangisiga qarab
      .limit(50) // Oxirgi 50 ta xabarni olishamiz (juda ortib ketmasligi uchun paginate ham qilsa bo'ladi)

    if (error) throw error

    return Response.json({ messages: messages || [] })
  } catch (err) {
    console.error('History fetch error:', err)
    return Response.json(
      { message: 'Xabarlar tarixini olishda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
