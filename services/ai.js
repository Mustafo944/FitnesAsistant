import { GoogleGenAI } from '@google/genai'
import { calculateBMI, getBMICategory, calculateCalories } from '@/lib/calculations'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const ACTIVITY_LABELS = {
  passiv: 'Passiv (kam harakat)',
  yengil: 'Yengil faollik (haftasiga 1-2 marta mashq)',
  o_rtacha: "O'rtacha faollik (haftasiga 3-4 marta mashq)",
  aktiv: 'Aktiv (haftasiga 5-6 marta mashq)',
}

const GOAL_LABELS = {
  ozish: "Vazn yo'qotish",
  semirish: "Vazn oshirish (mushak yig'ish)",
  forma_saqlash: 'Forma saqlash',
}

function safeParseJSON(text) {
  const cleaned = text.replace(/```json\n?|```/g, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("AI javobidan JSON topilmadi")
  try {
    return JSON.parse(match[0])
  } catch (e) {
    throw new Error("AI javobini parse qilib bo'lmadi")
  }
}

function handleGeminiError(e) {
  if (e?.status === 429 || e?.message?.includes('quota')) {
    throw new Error("AI limiti to'ldi. Bir oz kuting va qayta urinib ko'ring.")
  }
  if (e?.status === 503 || e?.message?.includes('unavailable')) {
    throw new Error("AI vaqtincha ishlamayapti. Keyinroq urinib ko'ring.")
  }
  throw e
}

export async function analyzeWithGemini(imageBase64, mimeType, metrics) {
  const bmi = calculateBMI(metrics.weight, metrics.height)
  const bmiCategory = getBMICategory(bmi)
  const calories = calculateCalories(metrics.weight, metrics.height, metrics.age, metrics.gender, metrics.activity_level)

  const prompt = `Sen professional fitness mutaxassisi va dietologsan. Foydalanuvchi rasmini va aniq ma'lumotlarini tahlil qil.

FOYDALANUVCHI MA'LUMOTLARI:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age}
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- Maqsad: ${GOAL_LABELS[metrics.goal] || 'Forma saqlash'}
- Faollik: ${ACTIVITY_LABELS[metrics.activity_level] || "O'rtacha"}

ANIQ HISOB-KITOBLAR (bularni o'zgartirma, aynan shu qiymatlarni ishlat):
- BMI: ${bmi} (${bmiCategory.label})
- Kunlik kaloriya (saqlash): ${calories.maintenance} kcal
- Kunlik kaloriya (ozish): ${calories.fatLoss} kcal

VAZIFA:
1. Rasmga qarab tana holatini vizual baholaYa (yog' foizi, mushak holati, tana proporsiyasi)
2. Maqsadga mos aniq mashq rejasi ber
3. Aniq diet maslahatlari ber
4. Hamma hisob-kitoblarni yuqoridagi qiymatlardan foydalanib yoz

QOIDALAR:
- Tibbiy tashxis qo'yma
- Faqat JSON qaytarYa, boshqa hech narsa yozma
- Barcha matnlar o'zbek tilida bo'lsin
- workout_plan da kamida 4 ta mashq bo'lsin
- diet_tips da kamida 5 ta maslahat bo'lsin

JAVOB FORMATI (faqat shu JSON, boshqa hech narsa):
{
  "summary": "Tana holati haqida 2-3 jumlali aniq xulosa",
  "bmi": { "value": ${bmi}, "category": "${bmiCategory.label}" },
  "estimated_calories": { "maintenance": ${calories.maintenance}, "fat_loss": ${calories.fatLoss} },
  "body_observations": ["vizual kuzatish 1", "vizual kuzatish 2", "vizual kuzatish 3"],
  "strengths": ["kuchli tomon 1", "kuchli tomon 2"],
  "improvement_areas": ["yaxshilash kerak 1", "yaxshilash kerak 2"],
  "workout_plan": [
    { "title": "Mashq nomi", "description": "Aniq bajarish usuli", "sets": "3x12", "frequency": "Haftada 3 marta", "rest": "60 soniya" }
  ],
  "diet_tips": ["aniq maslahat 1", "aniq maslahat 2", "aniq maslahat 3", "aniq maslahat 4", "aniq maslahat 5"],
  "weekly_calories": {
    "monday": ${calories.maintenance}, "tuesday": ${calories.maintenance},
    "wednesday": ${calories.fatLoss}, "thursday": ${calories.maintenance},
    "friday": ${calories.maintenance}, "saturday": ${calories.fatLoss}, "sunday": ${calories.fatLoss}
  },
  "safety_note": "Muhim ogohlantirish"
}`

  let result
  try {
    const aiResponse = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageBase64 } }
        ]
      }]
    })
    result = aiResponse
  } catch (e) { handleGeminiError(e) }

  return safeParseJSON(result.text)
}

export async function analyzeFoodWithGemini(imageBase64, mimeType) {
  const prompt = `Sen O'zbekistondagi professional dietolog va oshpazsan. Rasmda ko'rsatilgan ovqatni ANIQ tahlil qil.

VAZIFA:
1. Rasmda nima borligini aniqla (ovqat nomi, tarkibi)
2. Har bir ingredient uchun aniq kaloriya hisobla
3. Umumiy kaloriya va makrolarni hisobla
4. Sog'lom alternativalar tavsiya qil

QOIDALAR:
- Faqat JSON qaytarYa, boshqa hech narsa yozma
- Kaloriyalar ANIQ bo'lsin (taxminiy emas)
- O'zbek ovqatlari uchun an'anaviy retsept asosida hisobla
- Barcha matnlar o'zbek tilida

JAVOB FORMATI (faqat shu JSON):
{
  "food_name": "Ovqat nomi o'zbek tilida",
  "total_calories": 000,
  "macros": { "protein": 00, "carbs": 00, "fats": 00 },
  "health_score": 7,
  "health_note": "Qisqacha baholash",
  "ingredients": [
    { "name": "Ingredient nomi", "amount": "100g", "calories": 000 }
  ],
  "suggestions": ["Aniq maslahat 1", "Aniq maslahat 2"],
  "alternatives": [
    { "name": "Sog'lom alternativa", "calories": 000, "reason": "Nima uchun yaxshiroq" }
  ]
}`

  let result
  try {
    const aiResponse = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageBase64 } }
        ]
      }]
    })
    result = aiResponse
  } catch (e) { handleGeminiError(e) }

  return safeParseJSON(result.text)
}

export async function generatePlanWithGemini(metrics) {
  const bmi = calculateBMI(metrics.weight, metrics.height)
  const bmiCategory = getBMICategory(bmi)
  const calories = calculateCalories(metrics.weight, metrics.height, metrics.age, metrics.gender, metrics.activity_level)

  const goalLabel = GOAL_LABELS[metrics.goal] || 'Forma saqlash'
  const activityLabel = ACTIVITY_LABELS[metrics.activity_level] || "O'rtacha faollik"
  const targetCalories = metrics.goal === 'ozish' ? calories.fatLoss : calories.maintenance
  const protein = Math.round(metrics.weight * (metrics.gender === 'male' ? 2 : 1.8))
  const carbs = Math.round((targetCalories * 0.45) / 4)
  const fats = Math.round((targetCalories * 0.25) / 9)

  const prompt = `Sen professional fitness mutaxassisi, dietolog va trenersan. Foydalanuvchi uchun 7 kunlik aniq reja tuz.

FOYDALANUVCHI MA'LUMOTLARI:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age} yosh
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- BMI: ${bmi} (${bmiCategory.label})
- Maqsad: ${goalLabel}
- Faollik: ${activityLabel}
- Kunlik kaloriya: ${targetCalories} kcal
- Oqsil: ${protein}g, Uglevod: ${carbs}g, Yog': ${fats}g

QOIDALAR:
- Faqat JSON qaytarYa
- Har kun uchun 5 ta taom aniq bo'lsin
- Har kun uchun aniq mashq bo'lsin
- O'zbek milliy taomlaridan foydalan
- Barcha kaloriyalar ${targetCalories} kcal ga yaqin bo'lsin
- Barcha matnlar o'zbek tilida

JAVOB FORMATI (faqat shu JSON):
{
  "weekly_goal": "Bu hafta uchun aniq maqsad",
  "daily_calories": ${targetCalories},
  "macros": { "protein": "${protein}g", "carbs": "${carbs}g", "fats": "${fats}g" },
  "hydration": "Kuniga ${Math.round(metrics.weight * 35)}ml suv",
  "tips": ["Muhim maslahat 1", "Muhim maslahat 2", "Muhim maslahat 3"],
  "plan": [
    {
      "day": 1,
      "day_name": "Dushanba",
      "focus": "Mashq fokusi",
      "meals": [
        { "type": "Nonushta (7:00)", "food": "Aniq taom nomi va miqdori", "calories": ${Math.round(targetCalories * 0.25)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog: Xg" },
        { "type": "Kechki choy (10:00)", "food": "Aniq taom", "calories": ${Math.round(targetCalories * 0.10)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog: Xg" },
        { "type": "Tushlik (13:00)", "food": "Aniq taom nomi va miqdori", "calories": ${Math.round(targetCalories * 0.35)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog: Xg" },
        { "type": "Kechkiqlik (16:00)", "food": "Aniq taom", "calories": ${Math.round(targetCalories * 0.15)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog: Xg" },
        { "type": "Kechki ovqat (19:00)", "food": "Aniq taom nomi va miqdori", "calories": ${Math.round(targetCalories * 0.15)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog: Xg" }
      ],
      "workout": {
        "title": "Mashg'ulot nomi",
        "duration": "45-60 daqiqa",
        "warmup": "5 daqiqa yugurish yoki sakrash",
        "exercises": [
          { "name": "Mashq nomi", "sets": 4, "reps": "10-12", "rest": "60 soniya", "note": "Texnika ko'rsatmasi" }
        ],
        "cardio": { "type": "Kardiyo turi", "duration": "20 daqiqa", "intensity": "O'rta" },
        "cooldown": "5 daqiqa cho'zish"
      }
    }
  ]
}`

  let result
  try {
    const aiResponse = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    })
    result = aiResponse
  } catch (e) { handleGeminiError(e) }

  return safeParseJSON(result.text)
}

export async function chatWithGemini(message, history, profile) {
  const bmi = profile ? calculateBMI(profile.weight_kg, profile.height_cm) : null
  const bmiCategory = bmi ? getBMICategory(bmi) : null
  const calories = profile ? calculateCalories(profile.weight_kg, profile.height_cm, profile.age, profile.gender, profile.activity_level) : null

  const systemPrompt = `Sen FitnesAsistant — tajribali fitness trener, dietolog va sog'liq maslahatchisan.

FOYDALANUVCHI PROFILI:
${profile ? `- Ism: ${profile.first_name || 'Foydalanuvchi'}
- Bo'y: ${profile.height_cm} sm, Vazn: ${profile.weight_kg} kg
- Yosh: ${profile.age}, Jins: ${profile.gender === 'male' ? 'Erkak' : 'Ayol'}
- BMI: ${bmi} (${bmiCategory?.label})
- Maqsad: ${GOAL_LABELS[profile.goal] || 'Forma saqlash'}
- Faollik: ${ACTIVITY_LABELS[profile.activity_level] || "O'rtacha"}
- Kunlik kaloriya: ${calories?.maintenance} kcal (saqlash), ${calories?.fatLoss} kcal (ozish)` : 'Profil mavjud emas'}

QOIDALAR:
1. Har doim foydalanuvchi profiliga qarab javob ber
2. Aniq raqamlar ishlat: "150g oqsil", "haftada 3 marta", "20 daqiqa"
3. Tibbiy tashxis qo'yma, shifokorga yo'nalt
4. O'zbek tilida, qisqa va aniq javob ber
5. Har javobda kamida 1 ta aniq tavsiya bo'lsin
6. Markdown format ishlat`

  const formattedHistory = (history || []).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  let result
  try {
    const aiResponse = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ]
    })
    result = aiResponse
  } catch (e) { handleGeminiError(e) }

  return result.text
}
