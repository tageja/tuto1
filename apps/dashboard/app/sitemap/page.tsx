import React from 'react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

export default function SitemapPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Sơ đồ trang" subtitle="Tổng quan liên kết website." />
      <Section>
        <Card><div className="p-6">Danh mục liên kết sẽ hiển thị ở đây.</div></Card>
      </Section>
    </main>
  );
}




