import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersCommunityPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Cộng đồng" subtitle="Kết nối và chia sẻ kinh nghiệm." />
      <Section>
        <Card><div className="p-6">Sự kiện cộng đồng sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




