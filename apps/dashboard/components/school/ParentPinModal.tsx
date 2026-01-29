'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Key, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (schoolId: string, schoolName: string) => void;
}

export function ParentPinModal({ isOpen, onClose, onSuccess }: ParentPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(null);
      setLoading(false);
      setSuccess(false);
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input, max 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 6) {
      setError('Please enter a 6-digit PIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get access token from session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        setError('No active session. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/school/validate-parent-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid PIN. Please try again.');
        setLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      setLoading(false);

      // Wait a moment to show success message, then call onSuccess
      setTimeout(() => {
        onSuccess(data.schoolId, data.schoolName);
      }, 1500);
    } catch (err: any) {
      console.error('Error validating PIN:', err);
      setError('Failed to validate PIN. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enter School PIN</h2>
            <p className="text-sm text-gray-600">Enter the 6-digit code provided by your school</p>
          </div>
        </div>

        {/* Success state */}
        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Successfully Joined!</h3>
            <p className="text-sm text-gray-600">Redirecting to your school dashboard...</p>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  School PIN Code
                </label>
                <input
                  ref={inputRef}
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full px-4 py-3 text-2xl font-mono text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="000000"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code (numbers only)
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || pin.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    'Join School'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
