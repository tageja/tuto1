'use client';

import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { KPIGrid } from '../../components/ui/KPIGrid';
import { FeatureCard } from '../../components/ui/FeatureCard';
import { FAQ } from '../../components/ui/FAQ';
import { CTA } from '../../components/ui/CTA';
import { useI18n } from '../../contexts/I18nContext';

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title={t('aboutTuto')} subtitle={t('heroSubtitle')} />

      <Section>
        <KPIGrid items={[
          { label: 'Hours taught', value: '120,000+' },
          { label: 'Teachers', value: '8,500+' },
          { label: 'Schools & centers', value: '650+' },
          { label: 'Satisfaction', value: '97%' },
        ]} />
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard title={t('trustSafety')} desc={t('featureTeachersDesc')} />
          <FeatureCard title={t('progressReports')} desc={t('featureBookingsDesc')} />
          <FeatureCard title={t('community')} desc={t('communityTitle')} />
        </div>
      </Section>

      <Section>
        <FAQ items={[
          { q: 'Who is tuto. for?', a: 'Parents, students, teachers, and schools.' },
          { q: 'Free trial?', a: 'Yes, you can book a free trial session.' },
          { q: 'Safety?', a: 'Teacher verification, data protection, fast reporting.' },
        ]} />
      </Section>

      <Section>
        <CTA title={t('getStarted')} desc={t('heroSubtitle')} actionLabel={t('getStarted')} />
      </Section>
    </main>
  );
}

