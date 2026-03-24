import { GoogleGenAI } from '@google/genai'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const FOOD_SYSTEM_PROMPT = `Sen professional diyetologsan. Foydalanuvchi ovqat rasmini yuboradi.
Rasmni ko'rib, ovqat tarkibi va taxminiy kaloriyasini tahlil qil.
Javobni FAQAT qat'iy JSON formatida ber, boshqa hech narsa qo'shma.
Barcha matnlarni o'zbek tilida yoz.

JSON tuzilishi:
{
  "food_name": "Ovqat nomi",
  "total_calories": 450,
  "confidence": "yuqori",
  "ingredients": [
    { "name": "Guruch", "amount": "200g", "calories": 260 },
    { "name": "Go'sht", "amount": "100g", "calories": 150 }
  ],
  "macros": { "protein": "25g", "carbs": "50g", "fats": "15g", "fiber": "3g" },
  "health_score": 7,
  "health_note": "Yaxshi muvozanatli ovqat",
  "suggestions": ["Ko'proq sabzavot qo'shing", "Tuz miqdorini kamaytiring"]
}`

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ message: 'Rasm tanlang' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const imageBase64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const result = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: FOOD_SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            { text: 'Ushbu ovqat rasmini tahlil qiling.' },
          ],
        },
      ],
    })

    const text = result.text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("AI javobidan JSON ajratib bo'lmadi")
    }

    const analysis = JSON.parse(jsonMatch[0])
    return Response.json(analysis)
  } catch (err) {
    console.error('Food analyze error:', err)
    return Response.json(
      { message: err.message || 'Ovqat tahlilida xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
