'use client';

import { useState } from 'react';
import { X, Key, Copy, Check, RefreshCw, Clock, Mail } from 'lucide-react';

interface AdminCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    id: string;
    name: string;
    contact_email?: string;
  };
  onGenerate: () => Promise<{ code: string; expiresAt: string } | null>;
}

export function AdminCodeGenerator({ isOpen, onClose, school, onGenerate }: AdminCodeGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onGenerate();
      if (result) {
        setGeneratedCode(result.code);
        setExpiresAt(result.expiresAt);
      } else {
        setError('Failed to generate admin code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setExpiresAt(null);
    setCopied(false);
    setError(null);
    onClose();
  };

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl mx-4">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">Generate Admin Code</h2>
              <p className="text-sm text-text-muted">{school.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedCode ? (
            <div className="space-y-6">
              <div className="bg-surface rounded-xl p-4">
                <h3 className="font-medium text-text mb-2">About Admin Codes</h3>
                <ul className="space-y-2 text-sm text-text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    One-time use code for school admin onboarding
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Valid for 7 days after generation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Share securely with the school administrator
                  </li>
                </ul>
              </div>

              {school.contact_email && (
                <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg">
                  <Mail className="w-5 h-5 text-text-muted" />
                  <div className="text-sm">
                    <p className="text-text-muted">Primary contact</p>
                    <p className="text-text font-medium">{school.contact_email}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Generate Admin Code
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">Code Generated!</h3>
                <p className="text-sm text-text-muted">
                  Share this code with the school administrator
                </p>
              </div>

              {/* Code Display */}
              <div className="relative">
                <div className="bg-surface rounded-xl p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-text tracking-wider">
                    {generatedCode}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {copied && (
                <p className="text-center text-sm text-success">Copied to clipboard!</p>
              )}

              {/* Expiry Info */}
              {expiresAt && (
                <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <Clock className="w-5 h-5 text-warning flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-text font-medium">Expires on</p>
                    <p className="text-text-muted">{formatExpiryDate(expiresAt)}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-surface rounded-xl p-4">
                <h4 className="font-medium text-text mb-2">Next Steps</h4>
                <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
                  <li>Share the code securely with the school admin</li>
                  <li>Direct them to the admin onboarding page</li>
                  <li>They will enter this code to claim admin access</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


