import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersPaymentsPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Thanh toán" subtitle="Theo dõi thu nhập và thanh toán." />
      <Section>
        <Card><div className="p-6">Bảng thu nhập sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}

