import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

const steps = [
  { title: 'Tìm giáo viên', desc: 'Lọc theo môn học, địa điểm và đánh giá.' },
  { title: 'Đặt lịch', desc: 'Chọn thời gian phù hợp và xác nhận.' },
  { title: 'Học tập', desc: 'Kết nối, tham gia buổi học và tương tác.' },
  { title: 'Theo dõi', desc: 'Xem kết quả, phản hồi và kế hoạch tiếp theo.' },
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Cách hoạt động" subtitle="Tìm giáo viên phù hợp, đặt lịch, học tập và theo dõi tiến độ." />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <Card key={s.title}>
              <div className="p-6">
                <h2 className="text-xl font-medium">{s.title}</h2>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

