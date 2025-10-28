import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function TeachersQualityPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Chất lượng" subtitle="Chuẩn chất lượng và phản hồi." />
      <Section>
        <Card><div className="p-6">Hệ thống đảm bảo chất lượng sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}




