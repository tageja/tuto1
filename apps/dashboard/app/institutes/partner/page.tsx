import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesPartnerPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Đối tác" subtitle="Hợp tác cùng trung tâm/viện đào tạo." />
      <Section>
        <Card><div className="p-6">Liên hệ: partners@tuto.app</div></Card>
      </Section>
    </main>
  );
}




