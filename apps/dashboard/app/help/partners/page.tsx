import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function HelpPartnersPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Trợ giúp đối tác" subtitle="Tài liệu và hỗ trợ triển khai." />
      <Section>
        <Card><div className="p-6">Liên hệ: partners-support@tuto.app</div></Card>
      </Section>
    </main>
  );
}


