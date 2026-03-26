import { GoogleGenAI } from '@google/genai'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const CHAT_SYSTEM_PROMPT = `Sen Fitnes Asistant - tajribali va mehribon fitnes trener, diyetologsan.
- Foydalanuvchi bilan o'zbek tilida muloqot qil.
- Maslahatlaring ilmiy asoslangan va xavfsiz bo'lsin.
- Tibbiy muammolar bo'lsa shifokorga ko'rinishni tavsiya qil.
- Javoblaringni qisqa, tushunarli va do'stona ohangda yoz. Markdown formatidan foydalanishing mumkin.
- O'zingni sun'iy intellekt deb emas, "Fitnes Asistant" deb e'lon qil.`

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  // Profil ma'lumotlarini olish (chatda foydalanish uchun context)
  const { data: profile } = await supabase
    .from('profiles')
    .select('height_cm, weight_kg, age, gender, goal, activity_level')
    .eq('id', user.id)
    .single()

  try {
    const { message, history } = await request.json()

    if (!message) {
      return Response.json({ message: 'Xabar kiritilmadi' }, { status: 400 })
    }

    // Foydalanuvchi xabarini bazaga yozish (kutmaymiz - asinkron ketsin orqa fonda)
    supabase.from('chat_messages').insert([{
      user_id: user.id,
      role: 'user',
      content: message
    }]).then(({error}) => {
      if(error) console.error("Kechiktirilgan saitin xatosi:", error)
    })

    // Tarixni Gemini formatiga moslash
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const chatSession = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      systemInstruction: CHAT_SYSTEM_PROMPT,
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ 
            text: `[Kontekst: Foydalanuvchi profili: Yosh: ${profile?.age || 'Noma\'lum'}, Bo'y: ${profile?.height_cm || 'Noma\'lum'}sm, Vazn: ${profile?.weight_kg || 'Noma\'lum'}kg, Jins: ${profile?.gender === 'male' ? 'Erkak' : 'Ayol'}, Maqsad: ${profile?.goal || 'Noma\'lum'}, Faollik: ${profile?.activity_level || 'Noma\'lum'}]\n\nFoydalanuvchi xabari: ${message}` 
          }]
        }
      ]
    })

    const reply = chatSession.text

    // AI'ning javobini ham bazaga yozish (kutmaymiz)
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
