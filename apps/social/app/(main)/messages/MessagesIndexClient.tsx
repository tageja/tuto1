'use client';

import ConversationList from './ConversationList';

interface Props {
  myProfileId: string;
}

// Single ConversationList instance (never duplicated).
// Mobile: ConvList is full-width (empty state is hidden).
// Desktop (md+): ConvList is fixed-width sidebar + empty state panel on the right.
export default function MessagesIndexClient({ myProfileId }: Props) {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* ConvList: full-width on mobile, fixed sidebar on desktop */}
      <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white overflow-y-auto">
        <ConversationList myProfileId={myProfileId} />
      </div>

      {/* Right panel: empty state — desktop only */}
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
        <div className="text-center px-4">
          <span className="text-5xl" aria-hidden>
            💬
          </span>
          <p className="mt-4 font-medium text-gray-700">Chọn một cuộc trò chuyện</p>
          <p className="text-sm mt-1">hoặc bắt đầu trò chuyện mới từ trang hồ sơ</p>
        </div>
      </div>
    </div>
  );
}
