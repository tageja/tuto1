'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { createStory } from '@/lib/stories';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AUDIENCE_OPTIONS = [
  { value: 'public' as const, label: 'Công khai' },
  { value: 'school' as const, label: 'Chỉ trường học' },
  { value: 'followers' as const, label: 'Người theo dõi' },
];

export default function CreateStoryModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [audience, setAudience] = useState<'public' | 'school' | 'followers'>('school');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Vui lòng chọn ảnh hoặc video');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append(
        'json',
        JSON.stringify({
          mediaType: file.type.startsWith('video/') ? 'video' : 'photo',
          textOverlay: textOverlay.trim() || null,
          textColor,
          audience,
        }),
      );

      await createStory(formData);
      onSuccess();
      onClose();
      setFile(null);
      setPreview(null);
      setTextOverlay('');
    } catch (err) {
      setError((err as Error).message ?? 'Không thể đăng story.');
    } finally {
      setUploading(false);
    }
  }, [file, textOverlay, textColor, audience, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setTextOverlay('');
    setError(null);
    onClose();
  }, [preview, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Thêm tin</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!preview ? (
            <label className="block w-full aspect-[9/16] max-h-80 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#0B5FFF] transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500 text-sm">Chọn ảnh hoặc video</span>
            </label>
          ) : (
            <>
              <div className="relative w-full aspect-[9/16] max-h-80 rounded-lg overflow-hidden bg-black">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
                {textOverlay && (
                  <p
                    className="absolute bottom-4 left-4 right-4 text-center text-lg"
                    style={{ color: textColor }}
                  >
                    {textOverlay}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thêm chữ</label>
                <input
                  type="text"
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Thêm chữ"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
                <div className="flex gap-2 flex-wrap">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAudience(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        audience === opt.value
                          ? 'bg-[#0B5FFF] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full py-2 px-4 rounded-lg bg-[#0B5FFF] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Đang tải lên...' : 'Đăng'}
          </button>
        </div>
      </div>
    </div>
  );
}
