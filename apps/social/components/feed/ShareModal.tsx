'use client';

import { useState } from 'react';

interface Props {
  postId:  string;
  preview: string;
  onClose: () => void;
}

export default function ShareModal({ postId, preview, onClose }: Props) {
  const url = `https://tuto.social/post/${postId}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input text
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      input?.select();
    }
  };

  const handleNativeShare = () => {
    if (!navigator.share) return;
    const truncated = preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
    navigator.share({
      title: 'Bài viết từ Tuto Community',
      text:  `${truncated}\n\nĐược chia sẻ từ Tuto Community`,
      url,
    }).catch(() => {});
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Chia sẻ bài viết</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <input
            id="share-url-input"
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-gray-600 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={[
              'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-primary text-white hover:bg-blue-700',
            ].join(' ')}
          >
            {copied ? 'Đã sao chép!' : 'Sao chép'}
          </button>
        </div>

        {/* Native share */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Chia sẻ qua ứng dụng
          </button>
        )}
      </div>
    </div>
  );
}
