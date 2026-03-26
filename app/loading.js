import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'

export default function Loading() {
  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24">
      <div className="text-center mb-10">
        <div className="h-6 w-32 bg-white/5 animate-pulse rounded-full mx-auto mb-4" />
        <div className="h-10 w-48 bg-white/10 animate-pulse rounded-xl mx-auto mb-2" />
        <div className="h-4 w-24 bg-white/5 animate-pulse rounded-md mx-auto" />
      </div>

      <div className="space-y-8">
        <Card className="h-40 bg-white/5 border border-white/5 animate-pulse rounded-3xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-32 bg-white/5 border border-white/5 animate-pulse rounded-[24px]" />
          <Card className="h-32 bg-white/5 border border-white/5 animate-pulse rounded-[24px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-white/5 border border-white/5 animate-pulse rounded-[24px]" />
          <div className="h-28 bg-white/5 border border-white/5 animate-pulse rounded-[24px]" />
        </div>
      </div>
    </PageWrapper>
  )
}
