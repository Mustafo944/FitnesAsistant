// Ruxsat etilgan rasm turlari va maksimal hajm
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

// Yosh chegaralari
export const MIN_AGE = 10
export const MAX_AGE = 100

// Bo'y chegaralari (sm)
export const MIN_HEIGHT = 100
export const MAX_HEIGHT = 250

// Vazn chegaralari (kg)
export const MIN_WEIGHT = 20
export const MAX_WEIGHT = 300

// Jins variantlari
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
]

// Maqsad variantlari
export const GOAL_OPTIONS = [
  { value: 'ozish', label: 'Ozish' },
  { value: 'semirish', label: 'Vazn yig\'ish' },
  { value: 'forma_saqlash', label: 'Formada qolish' },
]

// Faollik darajasi
export const ACTIVITY_OPTIONS = [
  { value: 'passiv', label: 'Passiv (kam harakat)' },
  { value: 'yengil', label: 'Yengil (haftada 1-3 marta)' },
  { value: 'o_rtacha', label: 'O\'rtacha (haftada 3-5 marta)' },
  { value: 'aktiv', label: 'Aktiv (har kuni)' },
]

// BMI turkumlari
export const BMI_CATEGORIES = {
  UNDERWEIGHT: { max: 18.5, label: 'Kam vazn', color: 'text-blue-500' },
  NORMAL: { max: 25, label: 'Normal', color: 'text-green-500' },
  OVERWEIGHT: { max: 30, label: 'Ortiqcha vazn', color: 'text-yellow-500' },
  OBESE: { max: Infinity, label: 'Semizlik', color: 'text-red-500' },
}

// Supabase storage bucket
export const STORAGE_BUCKET = 'body-images'
