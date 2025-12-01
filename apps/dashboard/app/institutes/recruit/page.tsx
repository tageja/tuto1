import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesRecruitPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Tuyển dụng" subtitle="Quy trình tuyển giáo viên và cộng tác viên." />
      <Section>
        <Card><div className="p-6">Quy trình tuyển dụng sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




