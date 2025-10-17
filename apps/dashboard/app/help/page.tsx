import React from 'react';
import './globals.css';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';

export default function HelpPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Trợ giúp" subtitle="Trung tâm hỗ trợ cho người dùng." />
      <Section>
        <Card><div className="p-6">Tài liệu trợ giúp sẽ cập nhật.</div></Card>
      </Section>
    </main>
  );
}


