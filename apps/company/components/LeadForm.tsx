'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseBrowser } from '@/lib/supabase';

const ROLE_VALUES = ['school','center','teacher','parent','investor','partner','other'] as const;

export default function LeadForm() {
  const { t } = useLanguage();
  const [name,    setName]    = useState('');
  const [org,     setOrg]     = useState('');
  const [role,    setRole]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !org.trim() || !role) return;

    setStatus('sending');
    const { error } = await supabaseBrowser.from('company_leads').insert({
      name:         name.trim(),
      organisation: org.trim(),
      role,
      email:        email.trim() || null,
      phone:        phone.trim() || null,
      message:      message.trim() || null,
    });

    setStatus(error ? 'error' : 'success');
  };

  if (status === 'success') {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <p className="font-semibold text-accent text-lg">{t('form.success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">{t('form.name')}</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">{t('form.org')}</label>
          <input
            value={org} onChange={(e) => setOrg(e.target.value)}
            required
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">{t('form.role')}</label>
        <select
          value={role} onChange={(e) => setRole(e.target.value)}
          required
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">—</option>
          {ROLE_VALUES.map((r) => (
            <option key={r} value={r}>{t(`form.role.${r}` as never)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">{t('form.email')}</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">{t('form.phone')}</label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">{t('form.message')}</label>
        <textarea
          value={message} onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{t('form.error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? t('form.sending') : t('form.submit')}
      </button>
    </form>
  );
}
