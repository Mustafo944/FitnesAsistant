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

    const { error: userInsertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message
      })

    if (userInsertError) {
      console.error('Foydalanuvchi xabarini saqlashda xatolik:', userInsertError)
    }

    const reply = await chatWithGemini(message, history || [], profile)

    const { error: modelInsertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'model',
        content: reply
      })

    if (modelInsertError) {
      console.error('AI javobini saqlashda xatolik:', modelInsertError)
    }

    return Response.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return Response.json(
      { message: err.message || 'Server xatosi yuz berdi' },
      { status: 500 }
    )
  }
}
