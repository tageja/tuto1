import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesReviewsPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Đánh giá" subtitle="Quản lý phản hồi và uy tín." />
      <Section>
        <Card><div className="p-6">Bảng thống kê đánh giá sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}


