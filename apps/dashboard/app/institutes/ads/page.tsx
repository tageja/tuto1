import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesAdsPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Quảng cáo" subtitle="Chạy chiến dịch thu hút học viên." />
      <Section>
        <Card><div className="p-6">Kết nối kênh quảng cáo sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




