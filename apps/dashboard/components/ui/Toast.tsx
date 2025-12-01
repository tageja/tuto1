'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number; // milliseconds
}

export function Toast({ message, type = 'success', onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in">
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
        <p className={`${textColor} text-sm font-medium flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity p-1`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}








