'use client';

import React, { use } from 'react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { NotificationCenter } from '../../../../../components/notifications/NotificationCenter';

export default function AdminNotificationsPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { t } = useI18n();
  const { schoolId: rawSchoolId } = use(params);
  const schoolId = decodeURIComponent(rawSchoolId);

  return (
    <div className="p-6">
      <NotificationCenter
        role="admin"
        schoolId={schoolId}
        subtitle={t('notifications.subtitle.admin')}
      />
    </div>
  );
}


