import { GoogleGenAI } from '@google/genai'
import { calculateBMI, getBMICategory, calculateCalories } from '@/lib/calculations'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const ACTIVITY_LABELS = {
  passiv: 'Passiv (kam harakat)',
  yengil: 'Yengil faollik (haftasiga 1-2 marta mashq)',
  o_rtacha: 'O\'rtacha faollik (haftasiga 3-4 marta mashq)',
  aktiv: 'Aktiv (haftasiga 5-6 marta mashq)',
}

const GOAL_LABELS = {
  ozish: 'Vazn yo\'qotish',
  semirish: 'Vazn oshirish (mushak yig\'ish)',
  forma_saqlash: 'Forma saqlash',
}

export async function analyzeWithGemini(imageBase64, mimeType, metrics) {
  const bmi = calculateBMI(metrics.weight, metrics.height)
  const bmiCategory = getBMICategory(bmi)
  const calories = calculateCalories(metrics.weight, metrics.height, metrics.age, metrics.gender, metrics.activity_level)

  const SYSTEM_PROMPT = `Sen professional fitness mutaxassisi va dietologsan. 
Foydalanuvchi rasmini, tana holatini, shaxsiy maqsadini va jismoniy faolligini inobatga olib chuqur tahlil qil.
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

  const userPrompt = `Foydalanuvchi ma'lumotlari:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age}
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- Maqsad: ${GOAL_LABELS[metrics.goal] || "Forma saqlash"}
- Faollik darajasi: ${ACTIVITY_LABELS[metrics.activity_level] || "O'rtacha"}

Bizning hisob-kitoblarimiz (SHU QIYMATLARNI QO'LLANG):
- BMI: ${bmi} (${bmiCategory.label})
- TDEE (Ushlab turish): ${calories.maintenance} kcal
- Ozish uchun: ${calories.fatLoss} kcal

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
  
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI javobidan JSON ajratib bo'lmadi")
  }

  return JSON.parse(jsonMatch[0])
}

export async function generatePlanWithGemini(metrics) {
  const bmi = calculateBMI(metrics.weight, metrics.height)
  const bmiCategory = getBMICategory(bmi)
  const calories = calculateCalories(metrics.weight, metrics.height, metrics.age, metrics.gender, metrics.activity_level)

  const goalLabel = GOAL_LABELS[metrics.goal] || 'Forma saqlash'
  const activityLabel = ACTIVITY_LABELS[metrics.activity_level] || "O'rtacha faollik"

  const PLAN_SYSTEM_PROMPT = `Sen professional fitness mutaxassisi, dietolog va sportsmen treneringiz.
Foydalanuvchining ANIQ tana ko'rsatkichlari, BMI, kunlik kaloriya ehtiyoji va maqsadiga qarab 7 kunlik juda mukammal va detaill dieta va mashg'ulot rejasini tuz.

MAQSAD: Foydalanuvchining maqsadiga ${goalLabel} erishish uchun aniq, o'lchanadigan va kuzatiladigan reja ber.

Javobni FAQAT qat'iy JSON formatida ber. Boshqa hech qanday so'z qo'shma, faqat JSON.

JSON tuzilishi (HAR BIR QATOR TO'LDIRILISHI KERAK):
{
  "weekly_goal": "Bu hafta uchun aniq maqsad - nimaga erishish kerak",
  "daily_calories": ${calories.maintenance},
  "macros": {
    "protein_g_kg": ${metrics.gender === 'male' ? '2' : '1.8'}, 
    "protein": "${Math.round(metrics.weight * (metrics.gender === 'male' ? 2 : 1.8))}g",
    "carbs": "${Math.round((calories.maintenance * 0.45) / 4)}g",
    "fats": "${Math.round((calories.maintenance * 0.25) / 9)}g"
  },
  "hydration": "Kuniga ${Math.round(metrics.weight * 35)} ml suv ichish",
  "tips": ["Muhim maslahat 1", "Muhim maslahat 2"],
  "plan": [
    {
      "day": 1,
      "day_name": "Dushanba",
      "focus": "Mushak guruhi yoki diet focus",
      "meals": [
        { "type": "Ertalabki nonushta (7:00)", "food": "Aniq taom nomi va retsept qisqa", "calories": ${Math.round(calories.maintenance * 0.25)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog': Xg" },
        { "type": "Cho'michka (10:00)", "food": "Aniq taom", "calories": ${Math.round(calories.maintenance * 0.10)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog': Xg" },
        { "type": "Tushlik (13:00)", "food": "Aniq taom", "calories": ${Math.round(calories.maintenance * 0.35)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog': Xg" },
        { "type": "Kechkiqlik (16:00)", "food": "Aniq taom", "calories": ${Math.round(calories.maintenance * 0.15)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog': Xg" },
        { "type": "Kechki ovqat (19:00)", "food": "Aniq taom", "calories": ${Math.round(calories.maintenance * 0.15)}, "macros": "Oqsil: Xg, Uglevod: Xg, Yog': Xg" }
      ],
      "workout": {
        "title": "Mashg'ulot nomi",
        "duration": "45-60 daqiqa",
        "warmup": "5 daqiqa",
        "exercises": [
          { "name": "Mashq nomi", "sets": 4, "reps": "10-12", "rest": "60-90 soniya", "note": "Texnika ko'rsatmasi" },
          { "name": "Mashq nomi", "sets": 3, "reps": "12-15", "rest": "60 soniya", "note": "Texnika ko'rsatmasi" }
        ],
        "cardio": { "type": "Kardiyo turi", "duration": "20 daqiqa", "intensity": "O'rta" },
        "cooldown": "5 daqiqa cho'zish"
      }
    }
  ]
}`

  const userPrompt = `Foydalanuvchi ANIQ ma'lumotlari:
- Bo'y: ${metrics.height} sm
- Vazn: ${metrics.weight} kg
- Yosh: ${metrics.age} yosh
- Jins: ${metrics.gender === 'male' ? 'Erkak' : 'Ayol'}
- BMI: ${bmi} (${bmiCategory.label})
- Maqsad: ${goalLabel}
- Faollik darajasi: ${activityLabel}
- Kunlik kaloriya (TDEE): ${calories.maintenance} kcal
- Ozish rejimida: ${calories.fatLoss} kcal

TANLANGAN MUSHIK GURUHLARIGA E'TIBOR QARAT:
${metrics.gender === 'male' ? 
'- Erkak uchun: Ko\'krak, elkalar, orqa (biceps/triceps bilan) - muvozanatli rivojlanish' : 
'- Ayol uchun: Pastki tanani (gluteus, sonlar) va yadrolarni kuchaytirishga e\'tibor'}

7 KUNLIK REJA TAYYORLANG - HAR BIR KUN UCHUN ANIQ:
1. HAR KUN UCHUN 5 TA TAOM VAQTI (vaqt, nom, kaloriya, makrolar)
2. HAR KUN UCHUN ANIQ MASHG'ULOT (mashq nomi, setlar, takrorlashlar, dam olish)
3. KUNLIK SUV ME\'YORI
4. HAFTALIK MAQSAD`

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

export async function chatWithGemini(message, history, profile) {
  const bmi = profile ? calculateBMI(profile.weight_kg, profile.height_cm) : null
  const bmiCategory = bmi ? getBMICategory(bmi) : null
  const calories = profile ? calculateCalories(profile.weight_kg, profile.height_cm, profile.age, profile.gender, profile.activity_level) : null

  const userProfileContext = profile ? `
Foydalanuvchi PROFILI (javoblaringizda INOBATGA OLING):
- Ism: ${profile.first_name || 'Foydalanuvchi'}
- Bo'y: ${profile.height_cm} sm
- Vazn: ${profile.weight_kg} kg
- Yosh: ${profile.age} yosh
- Jins: ${profile.gender === 'male' ? 'Erkak' : 'Ayol'}
- BMI: ${bmi} (${bmiCategory?.label || 'Nomalum'})
- Maqsad: ${GOAL_LABELS[profile.goal] || 'Forma saqlash'}
- Faollik: ${ACTIVITY_LABELS[profile.activity_level] || "O'rtacha"}
- Kunlik kaloriya (TDEE): ${calories?.maintenance || 'Nomalum'} kcal
- Ozish uchun: ${calories?.fatLoss || 'Nomalum'} kcal
` : ''

  const CHAT_SYSTEM_PROMPT = `Sen Fitnes Asistant - tajribali va mehribon fitnes trener, diyetolog, sportsmen maslahatchi.

SIFAT: Professional fitness va sog'liq maslahatchi
TIL: O'zbek tilida javob ber, professional va ilmiy asoslangan

YAKOBIY QOIDALAR:
1. Foydalanuvchi profiliga QAT'IY AMAL QIL - uning tana ko'rsatkichlari, yoshi, jinsi va maqsadini inobatga ol
2. Aniq, o'lchanadigan maslahatlar ber (masalan: "150g oqsil", "haftasiga 3 marta", "20 daqiqa")
3. Ilmiy asoslangan maslahatlar ber - formulalar, tadqiqotlar yoki umumiy qoidalarga ishora qil
4. Tibbiy maslahat berma - shifokorga ko'rinishni tavsiya qil
5. Motivatsion va ijobiy bo'l
6. Har bir javobda kamida 1-2 aniq misol yoki tavsiya ber

JAVOB TUZILISHI:
- Qisqa xulosa (1-2 jumla)
- Asosiy maslahat/tavsiya (aniq va o'lchanadigan)
- Qo'shimcha maslahat yoki misol
- kerak bo'lsa: Aniq ovqat yoki mashq tavsiyasi

Format: Markdown bilan, ro'yxatlar va sarlavhalar ishlat.`

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
          text: `${userProfileContext}\n\nFoydalanuvchi xabari: ${message}`
        }]
      }
    ]
  })

  return chatSession.text
}
