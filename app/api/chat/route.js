import { GoogleGenAI } from '@google/genai'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { chatWithGemini } from '@/services/ai'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  try {
    const { message, history } = await request.json()

    if (!message) {
      return Response.json({ message: 'Xabar kiritilmadi' }, { status: 400 })
    }

    supabase.from('chat_messages').insert([{
      user_id: user.id,
      role: 'user',
      content: message
    }]).then(({error}) => {
      if(error) console.error("Kechiktirilgan saqlash xatosi:", error)
    })

    const reply = await chatWithGemini(message, history || [], profile)

    supabase.from('chat_messages').insert([{
      user_id: user.id,
      role: 'model',
      content: reply
    }]).then(({error}) => {
      if(error) console.error("Kechiktirilgan saqlash xatosi (model):", error)
    })

    return Response.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return Response.json(
      { message: err.message || 'Server xatosi yuz berdi' },
      { status: 500 }
    )
  }
}
