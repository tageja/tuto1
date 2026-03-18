'use client';

export default function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-200 rounded-full w-36" />
              <div className="h-3 bg-gray-200 rounded-full w-24" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3.5 bg-gray-200 rounded-full w-full" />
            <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
          </div>
          <div className="flex gap-4">
            <div className="h-8 bg-gray-200 rounded-full w-20" />
            <div className="h-8 bg-gray-200 rounded-full w-20" />
            <div className="h-8 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
