import React from 'react';
import './globals.css';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';

export default function BlogPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Blog" subtitle="Bài viết, mẹo học và câu chuyện." />
      <Section>
        <Card><div className="p-6">Bài viết mới sẽ xuất hiện ở đây.</div></Card>
      </Section>
    </main>
  );
}




