import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesCrmPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="CRM" subtitle="Quản lý khách hàng và liên hệ." />
      <Section>
        <Card><div className="p-6">Tính năng CRM sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




