'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type FeedTab = 'school' | 'forYou' | 'following';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'school',    label: 'Trường học' },
  { key: 'forYou',   label: 'Dành cho bạn' },
  { key: 'following', label: 'Đang theo dõi' },
];

interface Props {
  onTabChange?: (tab: FeedTab) => void;
}

export default function FeedFilters({ onTabChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as FeedTab) ?? 'school';

  const handleTabClick = (tab: FeedTab) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
    onTabChange?.(tab);
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
      <div className="max-w-xl mx-auto px-4 flex">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={[
                'flex-1 py-3 text-sm font-medium transition-colors relative',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
