import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersCalendarPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Lịch dạy" subtitle="Quản lý lịch và sắp xếp lớp." />
      <Section>
        <Card><div className="p-6">Lịch dạy trên web sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




