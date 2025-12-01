'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';

interface LogAdministrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  reminder: {
    id: string;
    student_id: string;
    medicine_name: string;
    dosage: string;
    school_students?: {
      first_name: string;
      last_name: string;
    };
  };
}

export function LogAdministrationModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  reminder,
}: LogAdministrationModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'completed' | 'missed' | 'skipped'>('completed');
  const [administeredAt, setAdministeredAt] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await fetch(`/api/school/${encodeURIComponent(schoolId)}/medicine/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminder_id: reminder.id,
          student_id: reminder.student_id,
          administered_at: new Date(administeredAt).toISOString(),
          status,
          note: note || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setStatus('completed');
        setAdministeredAt(new Date().toISOString().slice(0, 16));
        setNote('');
      } else {
        alert(result.error || 'Failed to log administration');
      }
    } catch (error) {
      console.error('Error logging administration:', error);
      alert('Failed to log administration');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const studentName = reminder.school_students 
    ? `${reminder.school_students.first_name} ${reminder.school_students.last_name}`
    : 'Unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('dashboard.medicine.logAdministration') || 'Log Administration'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Reminder Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-medium text-gray-900">{reminder.medicine_name}</p>
            <p className="text-sm text-gray-600">{reminder.dosage || '-'}</p>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.medicine.for') || 'For'}: {studentName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.medicine.log.status') || 'Status'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(['completed', 'missed', 'skipped'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      status === s
                        ? s === 'completed'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : s === 'missed'
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`dashboard.medicine.logStatus.${s}`) || s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.log.administeredAt') || 'Date & Time'}
              </label>
              <input
                type="datetime-local"
                value={administeredAt}
                onChange={(e) => setAdministeredAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.medicine.log.note') || 'Note'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.medicine.log.notePlaceholder') || 'Optional note...'}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('dashboard.medicine.form.cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (t('dashboard.medicine.form.saving') || 'Saving...') : (t('dashboard.medicine.log.save') || 'Log')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}


