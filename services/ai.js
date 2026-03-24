import { GoogleGenAI } from '@google/genai'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const SYSTEM_PROMPT = `Sen professional fitness mutaxassisi va dietologsan. 
Foydalanuvrchi rasmini, tana holatini, shaxsiy maqsadini (ozish/semirish) va jismoniy faolligini inobatga olib chuqur tahlil qil.
Maqsadiga erishish uchun eng yaxshi, ilmiy asoslangan va aniq maslahatlar ber.
Javobni FAQAT qat'iy JSON formatida ber, boshqa hech narsa qo'shma.
Barcha matnlarni o'zbek tilida yoz.
Tibbiy tashxis qo'yma, faqat umumiy va sportga oid maslahatlar ber.

JSON tuzilishi:
{
  "summary": "Umumiy tana holati haqida qisqacha xulosa",
  "bmi": { "value": 0, "category": "Normal" },
  "estimated_calories": { "maintenance": 0, "fat_loss": 0 },
  "body_observations": ["kuzatish 1", "kuzatish 2"],
  "strengths": ["kuchli tomon 1"],
  "improvement_areas": ["yaxshilash kerak 1"],
  "workout_plan": [{ "title": "Mashq nomi", "description": "Tavsif", "frequency": "Haftada 3 marta" }],
  "diet_tips": ["maslahat 1"],
  "safety_note": "Ogohlantirish"
}`

export async function analyzeWithGemini(imageBase64, mimeType, metrics) {
  const userPrompt = `Foydalanuvchi ma'lumotlari:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age}
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- Maqsad: ${metrics.goal || "Forma saqlash"}
- Faollik darajasi: ${metrics.activity_level || "O'rtacha"}

Bizning hisob-kitoblarimiz (SHU QIYMATLARNI QO'LLANG):
- BMI: ${metrics.bmi}
- TDEE (Ushlab turish): ${metrics.tdee} kcal
- Ozish uchun: ${metrics.tdee - 500} kcal

Vazifa: Ushbu rasmni va aniq hisob-kitoblarimizni tahlil qilib, foydalanuvchining MAQSADINI hisobga olgan holda gibrid aqlli xulosa ber. Xulosada bizning formulalar natijasini AI ko'rgan vizual holat bilan birlashtir.`

  const result = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: userPrompt },
        ],
      },
    ],
  })

  const text = result.text
  
  // JSON ni ajratib olish
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI javobidan JSON ajratib bo'lmadi")
  }

  return JSON.parse(jsonMatch[0])
}

export async function generatePlanWithGemini(metrics) {
  const PLAN_SYSTEM_PROMPT = `Sen professional fitness mutaxassisi va dietologsan.
Foydalanuvchining tana ko'rsatkichlari, maqsadi va faollik darajasiga qarab 7 kunlik mukammal dieta va mashg'ulot rejasini tuzib ber.
Javobni FAQAT qat'iy JSON formatida ber. Boshqa hech qanday so'z qo'shma.

JSON tuzilishi:
{
  "weekly_goal": "Haftalik maqsad va motivatsiya qisqacha",
  "daily_calories": 2500,
  "macros": { "protein": "150g", "carbs": "250g", "fats": "70g" },
  "plan": [
    {
      "day": 1,
      "meals": [
        { "type": "Ertuslik", "food": "Suli bo'tqasi va tuxum", "calories": 400 }
      ],
      "workout": {
        "title": "Ko'krak va Triceps",
        "exercises": ["Jyimlyoja 4x10", "Gantel ko'tarish 3x12"]
      }
    }
  ]
}`

  const userPrompt = `Foydalanuvchi ma'lumotlari:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age}
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- Maqsad: ${metrics.goal || "Forma saqlash"}
- Faollik darajasi: ${metrics.activity_level || "O'rtacha"}

Yuqoridagi ma'lumotlarga asoslanib 7 kunlik reja tayyorla.`

  const result = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: PLAN_SYSTEM_PROMPT },
          { text: userPrompt },
        ],
      },
    ],
  })

  const text = result.text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI javobidan JSON ajratib bo'lmadi")
  }

  return JSON.parse(jsonMatch[0])
}
