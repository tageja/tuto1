import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

const items = [
  { title: 'Ra mắt tính năng lập kế hoạch bài học', date: '2025-08-01' },
  { title: 'Hợp tác với 100+ trường học tại Hà Nội', date: '2025-07-12' },
  { title: 'Cập nhật hệ thống thanh toán an toàn', date: '2025-06-05' },
];

export default function NewsroomPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Truyền thông" subtitle="Tin tức, thông cáo báo chí và cập nhật sản phẩm." />

      <Section>
        <div className="grid gap-6">
          {items.map((it) => (
            <Card key={it.title}>
              <div className="p-6">
                <div className="text-lg font-medium">{it.title}</div>
                <div className="mt-1 text-gray-500 text-sm">{it.date}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

