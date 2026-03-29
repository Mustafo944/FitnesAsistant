export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 pb-24">
      <div className="h-8 w-36 bg-white/10 animate-pulse rounded-xl mx-auto mb-4" />
      <div className="space-y-6">
        <div className="h-40 bg-white/[0.03] animate-pulse rounded-[28px] border border-white/5" />
        <div className="h-32 bg-white/[0.03] animate-pulse rounded-[28px] border border-white/5" />
        <div className="h-32 bg-white/[0.03] animate-pulse rounded-[28px] border border-white/5" />
      </div>
    </div>
  )
}
