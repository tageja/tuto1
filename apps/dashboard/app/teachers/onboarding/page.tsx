import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersOnboardingPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Onboarding giáo viên" subtitle="Thiết lập hồ sơ và lịch dạy." />
      <Section>
        <Card><div className="p-6">Hướng dẫn chi tiết sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}

