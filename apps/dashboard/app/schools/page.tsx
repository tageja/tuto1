import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function SchoolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Dành cho trường học</h1>
      <p className="mt-2 text-gray-600">Giải pháp quản lý và học tập toàn diện.</p>
      <section className="grid gap-6 md:grid-cols-3 mt-6">
        {[
          { title: 'Phân tích', href: '/schools/analytics' },
          { title: 'Lập kế hoạch bài học', href: '/schools/lesson-planner' },
          { title: 'Đánh giá', href: '/schools/assessments' },
          { title: 'Onboarding', href: '/schools/onboarding' },
          { title: 'Case study', href: '/schools/case-studies' },
          { title: 'Bảng giá', href: '/schools/pricing' },
        ].map((x) => (
          <Card key={x.title}>
            <a className="block p-6" href={x.href}>
              <div className="text-lg font-medium">{x.title}</div>
            </a>
          </Card>
        ))}
      </section>
    </main>
  );
}


