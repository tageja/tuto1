'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useRouter } from 'next/navigation';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fullFormRoute: string;
  children: React.ReactNode;
  onQuickSubmit?: (data: any) => Promise<void>;
}

export function QuickAddModal({ 
  isOpen, 
  onClose, 
  title, 
  fullFormRoute, 
  children,
  onQuickSubmit 
}: QuickAddModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMoreOptions = () => {
    onClose();
    router.push(fullFormRoute);
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onQuickSubmit) {
      setSubmitting(true);
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        await onQuickSubmit(data);
        onClose();
      } catch (error) {
        console.error('Quick submit error:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleQuickSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleMoreOptions}
          >
            More Options
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !onQuickSubmit}
              title={!onQuickSubmit ? "Coming in Phase 2" : ""}
            >
              {submitting ? 'Saving...' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

