import React from 'react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

export default function StatusPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Trạng thái hệ thống" subtitle="Tình trạng dịch vụ hiện tại." />
      <Section>
        <Card><div className="p-6">Tất cả dịch vụ đang hoạt động bình thường.</div></Card>
      </Section>
    </main>
  );
}




