export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 pb-24">
      <div className="h-8 w-48 bg-white/10 animate-pulse rounded-xl mx-auto mb-6" />
      <div className="space-y-5">
        {[1,2,3].map(i => (
          <div key={i} className="h-28 bg-white/[0.03] animate-pulse rounded-[24px] border border-white/5" />
        ))}
      </div>
    </div>
  )
}
