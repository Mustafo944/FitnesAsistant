export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 pb-24">
      <div className="text-center mb-10">
        <div className="h-5 w-28 bg-white/5 animate-pulse rounded-full mx-auto mb-3" />
        <div className="h-8 w-40 bg-white/10 animate-pulse rounded-xl mx-auto mb-2" />
      </div>
      <div className="space-y-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-white/[0.03] animate-pulse rounded-[24px] border border-white/5" />
        ))}
      </div>
    </div>
  )
}
