import Card from '@/components/ui/Card'

export default function CalorieCard({ calories }) {
  if (!calories) return null

  return (
    <Card neon="blue">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Kunlik kaloriya</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Maintenance */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between group/item">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] icon-neon-blue group-hover/item:scale-110 transition-transform">
              <span className="text-xl">💧</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Ushlab turish</p>
              <p className="text-xl font-bold text-blue-400">{calories.maintenance}</p>
            </div>
          </div>
          <span className="text-[10px] text-gray-600 font-bold">kkal/kun</span>
        </div>

        {/* Fat Loss */}
        <div className="bg-pink-500/5 rounded-2xl p-4 border border-pink-500/10 flex items-center justify-between shadow-[inset_0_0_15px_rgba(244,114,182,0.05)] group/item">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20 shadow-[0_0_15px_rgba(244,114,182,0.3)] icon-neon-purple group-hover/item:scale-110 transition-transform">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <p className="text-[10px] text-pink-400/60 font-bold uppercase">Ozish uchun</p>
              <p className="text-xl font-bold text-pink-400">{calories.fat_loss}</p>
            </div>
          </div>
          <span className="text-[10px] text-pink-400/40 font-bold">kkal/kun</span>
        </div>
      </div>
    </Card>
  )
}
