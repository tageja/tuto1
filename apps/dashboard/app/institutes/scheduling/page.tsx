import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesSchedulingPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Lịch" subtitle="Xếp lịch lớp và tài nguyên." />
      <Section>
        <Card><div className="p-6">Bảng lịch cho tổ chức sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}


