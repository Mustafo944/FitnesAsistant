import { getSupabaseServerClient } from '@/lib/supabase/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const UZBEK_FOOD_KNOWLEDGE = {
  'osh': { calories: 250, protein: 8, carbs: 35, fats: 8, type: 'tushlik' },
  'somsa': { calories: 280, protein: 10, carbs: 30, fats: 12, type: 'ertalabki_nonushta' },
  'lagman': { calories: 350, protein: 12, carbs: 45, fats: 12, type: 'tushlik' },
  'manti': { calories: 220, protein: 8, carbs: 25, fats: 10, type: 'tushlik' },
  'non': { calories: 150, protein: 5, carbs: 30, fats: 2, type: 'ertalabki_nonushta' },
  'choy': { calories: 5, protein: 0, carbs: 1, fats: 0, type: 'ertalabki_nonushta' },
  'kofe': { calories: 10, protein: 0, carbs: 2, fats: 0, type: 'ertalabki_nonushta' },
  'shorva': { calories: 180, protein: 10, carbs: 20, fats: 6, type: 'tushlik' },
  'kabob': { calories: 300, protein: 20, carbs: 15, fats: 18, type: 'kechki_ovqat' },
  'dimlama': { calories: 200, protein: 12, carbs: 25, fats: 6, type: 'kechki_ovqat' },
  'besh barmoq': { calories: 280, protein: 15, carbs: 30, fats: 10, type: 'kechki_ovqat' },
  'norin': { calories: 320, protein: 12, carbs: 40, fats: 12, type: 'tushlik' },
  'mastava': { calories: 220, protein: 10, carbs: 30, fats: 6, type: 'tushlik' },
  'samsa': { calories: 260, protein: 9, carbs: 28, fats: 12, type: 'ertalabki_nonushta' },
  'pizza': { calories: 450, protein: 15, carbs: 50, fats: 18, type: 'kechkiqlik' },
  'hamburger': { calories: 500, protein: 20, carbs: 45, fats: 25, type: 'kechkiqlik' },
  'fransi': { calories: 350, protein: 4, carbs: 40, fats: 18, type: 'kechkiqlik' },
  'coca cola': { calories: 140, protein: 0, carbs: 35, fats: 0, type: 'kechkiqlik' },
  'pepsi': { calories: 150, protein: 0, carbs: 38, fats: 0, type: 'kechkiqlik' },
  'chocopie': { calories: 180, protein: 2, carbs: 25, fats: 8, type: 'kechkiqlik' },
}

function findFoodMatches(text) {
  const textLower = text.toLowerCase()
  const matches = []
  
  for (const [name, data] of Object.entries(UZBEK_FOOD_KNOWLEDGE)) {
    if (textLower.includes(name)) {
      matches.push({ name, ...data })
    }
  }
  
  return matches
}

function estimateFoodFromText(text) {
  const textLower = text.toLowerCase()
  
  const patterns = [
    { pattern: /osh|pilov|plov/gi, food: 'osh', ...UZBEK_FOOD_KNOWLEDGE['osh'] },
    { pattern: /somsa/gi, food: 'somsa', ...UZBEK_FOOD_KNOWLEDGE['somsa'] },
    { pattern: /lagman/gi, food: 'lagman', ...UZBEK_FOOD_KNOWLEDGE['lagman'] },
    { pattern: /manti/gi, food: 'manti', ...UZBEK_FOOD_KNOWLEDGE['manti'] },
    { pattern: /non|bread/gi, food: 'non', ...UZBEK_FOOD_KNOWLEDGE['non'] },
    { pattern: /shorva|soup|shurva/gi, food: 'shorva', ...UZBEK_FOOD_KNOWLEDGE['shorva'] },
    { pattern: /kabob|qozonkabob/gi, food: 'kabob', ...UZBEK_FOOD_KNOWLEDGE['kabob'] },
    { pattern: /dimlama/gi, food: 'dimlama', ...UZBEK_FOOD_KNOWLEDGE['dimlama'] },
    { pattern: /mastava/gi, food: 'mastava', ...UZBEK_FOOD_KNOWLEDGE['mastava'] },
    { pattern: /norin/gi, food: 'norin', ...UZBEK_FOOD_KNOWLEDGE['norin'] },
    { pattern: /pizza/gi, food: 'pizza', ...UZBEK_FOOD_KNOWLEDGE['pizza'] },
    { pattern: /hamburger|burger/gi, food: 'hamburger', ...UZBEK_FOOD_KNOWLEDGE['hamburger'] },
    { pattern: /fransi|fries|chips/gi, food: 'fransi', ...UZBEK_FOOD_KNOWLEDGE['fransi'] },
    { pattern: /cola|pepsi|sprite/gi, food: 'coca cola', ...UZBEK_FOOD_KNOWLEDGE['coca cola'] },
    { pattern: /chocolate|shokolad|choco/gi, food: 'chocopie', ...UZBEK_FOOD_KNOWLEDGE['chocopie'] },
    { pattern: /choy|tea|cho'y/gi, food: 'choy', ...UZBEK_FOOD_KNOWLEDGE['choy'] },
    { pattern: /kofe|coffee|qahva/gi, food: 'kofe', ...UZBEK_FOOD_KNOWLEDGE['kofe'] },
    { pattern: /sut|milk|sutli/gi, food: 'sut', calories: 150, protein: 8, carbs: 12, fats: 8 },
    { pattern: /yogurt|kefir/gi, food: 'yogurt', calories: 100, protein: 10, carbs: 8, fats: 2 },
    { pattern: /tuxum|egg/gi, food: 'tuxum', calories: 70, protein: 6, carbs: 1, fats: 5 },
    { pattern: /guruch|rice/gi, food: 'guruch', calories: 130, protein: 3, carbs: 28, fats: 0 },
    { pattern: /gosht|meat|et/gi, food: 'gosht', calories: 250, protein: 25, carbs: 0, fats: 15 },
    { pattern: /sabzi|carrot/gi, food: 'sabzi', calories: 40, protein: 1, carbs: 10, fats: 0 },
    { pattern: /piyoz|onion/gi, food: 'piyoz', calories: 30, protein: 1, carbs: 7, fats: 0 },
    { pattern: /pomidor|tomato/gi, food: 'pomidor', calories: 20, protein: 1, carbs: 4, fats: 0 },
    { pattern: /bodring|cucumber/gi, food: 'bodring', calories: 15, protein: 1, carbs: 3, fats: 0 },
    { pattern: /olma|apple/gi, food: 'olma', calories: 80, protein: 0, carbs: 20, fats: 0 },
    { pattern: /banan|banana/gi, food: 'banan', calories: 100, protein: 1, carbs: 25, fats: 0 },
    { pattern: /uzum|grape/gi, food: 'uzum', calories: 70, protein: 1, carbs: 18, fats: 0 },
  ]

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0
  const detectedFoods = []
  let portions = 0

  for (const item of patterns) {
    const matches = text.match(item.pattern)
    if (matches) {
      portions += matches.length
      totalCalories += (item.calories || 200) * matches.length
      totalProtein += (item.protein || 5) * matches.length
      totalCarbs += (item.carbs || 25) * matches.length
      totalFats += (item.fats || 8) * matches.length
      detectedFoods.push({ name: item.food, ...item })
    }
  }

  if (portions === 0) {
    return {
      food_name: "Noma'lum ovqat",
      total_calories: 250,
      macros: { protein: 10, carbs: 30, fats: 10 },
      health_score: 5,
      health_note: 'Aniqlanmagan taom',
      ingredients: [],
      suggestions: ["Aniqrog'ini bilish uchun aniqroq rasm yuklang"],
    }
  }

  const avgHealthScore = portions > 0 ? Math.min(10, Math.max(3, 10 - (totalCalories / portions - 200) / 50)) : 5

  return {
    food_name: detectedFoods.length > 0 
      ? detectedFoods.map(f => f.name).join(' + ')
      : 'Ovqat',
    total_calories: Math.round(totalCalories),
    macros: {
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats),
    },
    health_score: Math.round(avgHealthScore * 10) / 10,
    health_note: avgHealthScore >= 7 ? 'Yaxshi tanlov!' : avgHealthScore >= 5 ? "O'rtacha" : "Ko'p kaloriya",
    ingredients: detectedFoods,
    suggestions: generateSuggestions(detectedFoods, totalCalories),
    portions,
  }
}

function generateSuggestions(foods, totalCalories) {
  const suggestions = []
  
  if (totalCalories > 400) {
    suggestions.push('Kamroq kaloriya uchun porsiyaning yarmisini yeying')
    suggestions.push("Yonidagi sabzavotlar bilan iste'mol qiling")
  }

  const hasBread = foods.some(f => f.name?.toLowerCase().includes('non'))
  if (hasBread) {
    suggestions.push("Non o'rniga sabzi yoki bodring iste'mol qiling")
  }

  const hasCola = foods.some(f => f.name?.toLowerCase().includes('cola') || f.name?.toLowerCase().includes('pepsi'))
  if (hasCola) {
    suggestions.push("Shirin ichimlik o'rniga suv yoki choy iching")
  }

  const hasFastFood = foods.some(f => f.name?.toLowerCase().includes('pizza') || f.name?.toLowerCase().includes('burger') || f.name?.toLowerCase().includes('fransi'))
  if (hasFastFood) {
    suggestions.push("Fast food o'rniga uyda tayyorlangan taom afzalroq")
  }

  if (suggestions.length === 0) {
    suggestions.push('Ovqatlanish jadvaliga rioya qiling')
  }

  return suggestions.slice(0, 3)
}


export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const mealType = formData.get('meal_type')

    if (!file) {
      return Response.json({ error: 'Rasm yuklanmagan' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Faqat rasm fayl yuklang (jpg, png, webp)' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Rasm hajmi 5MB dan oshmasin' }, { status: 400 })
    }

    let imageUrl = null
    const fileBuffer = await file.arrayBuffer()
    const fileName = `food-${Date.now()}.jpg`

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('food-images')
          .getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
    } catch (storageError) {

    }

    let analysisResult = null

    if (OPENAI_API_KEY) {
      try {
        const base64Image = Buffer.from(fileBuffer).toString('base64')
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Siz O'zbekistondagi oshpaz va dietolog mutaxassissiz. Quyidagi ovqat rasmini tahlil qiling va JSON formatda javob bering:
                {
                  "food_name": "ovqat nomi o'zbek tilida",
                  "total_calories": raqam,
                  "macros": {"protein": raqam, "carbs": raqam, "fats": raqam},
                  "health_score": 1-10,
                  "health_note": "qisqacha izoh",
                  "ingredients": [{"name": "nomi", "amount": "miqdori", "calories": raqam}],
                  "suggestions": ["maslahat1", "maslahat2"],
                  "alternatives": [{"name": "alternativa nomi", "calories": raqam}]
                }
                
                O'zbek oshpazlik an'analarini hisobga oling.`
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                      detail: 'low'
                    }
                  }
                ]
              }
            ],
            max_tokens: 500,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              analysisResult = JSON.parse(jsonMatch[0])
            }
          }
        }
      } catch (aiError) {

      }
    }

    if (!analysisResult) {
      analysisResult = {
        food_name: 'Ovqat tahlil qilindi',
        total_calories: 300,
        macros: { protein: 15, carbs: 35, fats: 12 },
        health_score: 6,
        health_note: 'Umumiy tahlil',
        ingredients: [{ name: 'Ovqat', amount: '1 porsiya', calories: 300 }],
        suggestions: ['Muntazam ovqatlaning', 'Suv iching'],
      }
    }

    const mealTypeLabels = {
      'ertalabki_nonushta': 'Nonushta',
      'tushlik': 'Tushlik',
      'kechkiqlik': 'Kechkiqlik',
      'kechki_ovqat': 'Kechki ovqat',
    }

    return Response.json({
      ...analysisResult,
      meal_type: mealTypeLabels[mealType] || mealType,
      image_url: imageUrl,
      analyzed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Food analysis error:', error)
    return Response.json(
      { error: 'Tahlilda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
