'use client';

import { Card } from '../../ui/Card';
import { StudentNote } from '../../../lib/types/students';
import { useI18n } from '../../../contexts/I18nContext';
import { EmptyState } from '../../shared/EmptyState';

interface NotesTabProps {
  notes: StudentNote[];
}

export function NotesTab({ notes }: NotesTabProps) {
  const { t, lang } = useI18n();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (notes.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.students.notes.empty.title') || 'No Notes'}
        description={t('dashboard.students.notes.empty.description') || 'No notes found for this student.'}
        actionLabel=""
        onAction={undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mr-2">
                {note.type}
              </span>
              {note.author && (
                <span className="text-sm text-gray-600">
                  {t('dashboard.students.notes.by') || 'by'} {note.author}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap">{note.note}</p>
        </Card>
      ))}
    </div>
  );
}

