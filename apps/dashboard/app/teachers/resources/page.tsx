import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersResourcesPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Tài nguyên" subtitle="Tài liệu giảng dạy và mẫu bài." />
      <Section>
        <Card><div className="p-6">Kho tài nguyên sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}


