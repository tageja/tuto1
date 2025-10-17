import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesBillingPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Thanh toán" subtitle="Hóa đơn và đối soát cho tổ chức." />
      <Section>
        <Card><div className="p-6">Tổng quan hóa đơn sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}


