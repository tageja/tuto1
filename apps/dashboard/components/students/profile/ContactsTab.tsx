'use client';

import { Card } from '../../ui/Card';
import { StudentProfile } from '../../../lib/types/students';
import { useI18n } from '../../../contexts/I18nContext';
import { Phone, Mail } from 'lucide-react';
import { EmptyState } from '../../shared/EmptyState';

interface ContactsTabProps {
  student: StudentProfile;
}

export function ContactsTab({ student }: ContactsTabProps) {
  const { t } = useI18n();

  const hasContacts =
    (student.parentPrimary && (student.parentPrimary.name || student.parentPrimary.phone || student.parentPrimary.email)) ||
    (student.parentSecondary && (student.parentSecondary.name || student.parentSecondary.phone || student.parentSecondary.email)) ||
    student.parentEmail ||
    student.parentPhone;

  if (!hasContacts) {
    return (
      <EmptyState
        title={t('dashboard.students.contacts.empty.title') || 'No Contacts'}
        description={t('dashboard.students.contacts.empty.description') || 'No contact information available for this student.'}
        actionLabel=""
        onAction={undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Parent */}
      {student.parentPrimary && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.students.contacts.primaryParent') || 'Primary Parent'}
          </h3>
          <div className="space-y-3">
            {student.parentPrimary.name && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.name') || 'Name'}
                </p>
                <p className="text-gray-900">{student.parentPrimary.name}</p>
              </div>
            )}
            {student.parentPrimary.phone && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.phone') || 'Phone'}
                </p>
                <a
                  href={`tel:${student.parentPrimary.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {student.parentPrimary.phone}
                </a>
              </div>
            )}
            {student.parentPrimary.email && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.email') || 'Email'}
                </p>
                <a
                  href={`mailto:${student.parentPrimary.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {student.parentPrimary.email}
                </a>
              </div>
            )}
            {student.parentPrimary.relationship && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.relationship') || 'Relationship'}
                </p>
                <p className="text-gray-900">{student.parentPrimary.relationship}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Secondary Parent */}
      {student.parentSecondary && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.students.contacts.secondaryParent') || 'Secondary Parent'}
          </h3>
          <div className="space-y-3">
            {student.parentSecondary.name && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.name') || 'Name'}
                </p>
                <p className="text-gray-900">{student.parentSecondary.name}</p>
              </div>
            )}
            {student.parentSecondary.phone && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.phone') || 'Phone'}
                </p>
                <a
                  href={`tel:${student.parentSecondary.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {student.parentSecondary.phone}
                </a>
              </div>
            )}
            {student.parentSecondary.email && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.email') || 'Email'}
                </p>
                <a
                  href={`mailto:${student.parentSecondary.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {student.parentSecondary.email}
                </a>
              </div>
            )}
            {student.parentSecondary.relationship && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.relationship') || 'Relationship'}
                </p>
                <p className="text-gray-900">{student.parentSecondary.relationship}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Fallback: Use student's parent fields if parentPrimary/parentSecondary not available */}
      {!student.parentPrimary && !student.parentSecondary && (student.parentEmail || student.parentPhone) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.students.contacts.parent') || 'Parent Contact'}
          </h3>
          <div className="space-y-3">
            {student.parent && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.name') || 'Name'}
                </p>
                <p className="text-gray-900">{student.parent}</p>
              </div>
            )}
            {student.parentPhone && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.phone') || 'Phone'}
                </p>
                <a
                  href={`tel:${student.parentPhone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {student.parentPhone}
                </a>
              </div>
            )}
            {student.parentEmail && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.students.contacts.email') || 'Email'}
                </p>
                <a
                  href={`mailto:${student.parentEmail}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {student.parentEmail}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

