import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="Điều khoản" subtitle="Điều khoản sử dụng dịch vụ." />
      <Section>
        <Card><div className="p-6">Nội dung điều khoản sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




