import Card from '@/components/ui/Card'

export default function DietTips({ tips }) {
  if (!tips?.length) return null

  return (
    <Card neon="orange" className="relative group/card overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex gap-4 mb-6">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.4)] icon-neon-orange group-hover/card:scale-110 transition-transform duration-500">
              <span className="text-2xl">🍎</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Oqatlanish tavsiyalari</h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">Kuniga 3 mahal + 2 ta oraliq ovqat • Muvozanatli dieta</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/5 border border-orange-500/10 text-[10px] font-bold text-orange-300 uppercase tracking-tighter">
                <span className="opacity-60 text-xs">🥦</span>
                {tip.split(' ').slice(0, 3).join(' ')}...
              </div>
            ))}
            {/* Hardcoded pill badges to match image look */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold text-emerald-300 uppercase tracking-tighter">
              <span className="opacity-60 text-xs">🥗</span>
              Sabzavotlar ko&apos;p
            </div>
          </div>
        </div>

        {/* Decorative corner image placeholder */}
        <div className="hidden md:block w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-500/20 to-transparent border border-white/5 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 flex items-center justify-center grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all">
            <span className="text-5xl">🍗</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
