export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-transparent">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 animate-pulse mb-6" />
          <div className="h-6 w-48 bg-white/10 animate-pulse rounded-xl mb-3" />
          <div className="h-4 w-72 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="px-4 pb-8 pt-4">
          <div className="h-16 bg-white/5 rounded-[32px] animate-pulse border border-white/10" />
        </div>
      </div>
    </div>
  )
}
