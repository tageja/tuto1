'use client';

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';
import { useI18n } from '../../../contexts/I18nContext';

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title={t('privacyPolicy')} subtitle={t('heroSubtitle')} />
      <Section>
        <Card><div className="p-6">Content will be updated.</div></Card>
      </Section>
    </main>
  );
}

