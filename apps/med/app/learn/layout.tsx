import LearnerSidebar from '@/components/learn/LearnerSidebar'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <LearnerSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
