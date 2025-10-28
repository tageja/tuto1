import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function CookiesPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="Chính sách cookie" subtitle="Chính sách cookie." />
      <Section>
        <Card><div className="p-6">Chi tiết cookie sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




