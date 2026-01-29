'use client';

import { useState } from 'react';
import { Copy, Check, Key } from 'lucide-react';
import { Card } from '../ui/Card';

interface ParentPinDisplayProps {
  pin: string;
  schoolName?: string;
  className?: string;
}

export function ParentPinDisplay({ pin, schoolName, className = '' }: ParentPinDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy PIN:', err);
    }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Parent Access Code
            </h3>
          </div>
          {schoolName && (
            <p className="text-xs text-gray-600 mb-3">{schoolName}</p>
          )}
          <div className="flex items-center gap-3">
            <code className="text-3xl font-mono font-bold text-blue-700 tracking-wider">
              {pin}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Share this code with parents so they can join your school
          </p>
        </div>
      </div>
    </Card>
  );
}
