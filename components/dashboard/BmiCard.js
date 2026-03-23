import Card from '@/components/ui/Card'
import { getBMICategory } from '@/lib/calculations'

export default function BmiCard({ bmi }) {
  if (!bmi) return null

  const category = getBMICategory(bmi.value)
  const percent = Math.min(Math.max(((bmi.value - 15) / 20) * 100, 0), 100)

  return (
    <Card neon="blue" className="relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">BMI ko&apos;rsatkichi</h3>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-bold text-white">{bmi.value}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
              {bmi.category || category.label}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Progress Bar */}
      <div className="relative mt-8 mb-2">
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500" />
          
          {/* Indicator Marker */}
          <div 
            className="absolute top-0 h-full w-4 bg-white shadow-[0_0_10px_white] transition-all duration-1000 ease-out z-10"
            style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        
        {/* Glow effect under the marker */}
        <div 
          className="absolute top-0 h-2 w-8 bg-white/20 blur-md transition-all duration-1000 ease-out" 
          style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-gray-600 font-bold px-1">
        <span>15</span>
        <span className="translate-x-4">25</span>
        <span>35+</span>
      </div>
    </Card>
  )
}
