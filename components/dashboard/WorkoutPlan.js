import Card from '@/components/ui/Card'

export default function WorkoutPlan({ workouts }) {
  if (!workouts?.length) return null

  return (
    <Card neon="purple" className="relative group/card">
      <div className="flex gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.4)] icon-neon-blue group-hover/card:scale-110 transition-transform duration-500">
          <span className="text-2xl">🏋️</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Mashq rejasi</h3>
          <p className="text-xs text-gray-500">Haftasiga 4-5 kun • Yog' yoqish + Mushakni mustahkamlash</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {workouts.map((workout, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">
            <span className="opacity-60 text-xs">⚡</span>
            {workout.title} ({workout.frequency})
          </div>
        ))}
        {/* Decorative Pill Badge from image */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold text-purple-300 uppercase tracking-tighter">
          <span className="opacity-60 text-xs">🧘</span>
          Core & Stretching
        </div>
      </div>
    </Card>
  )
}
