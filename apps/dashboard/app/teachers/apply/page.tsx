import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';
import { Button } from '../../../components/ui/Button';

export default function TeachersApplyPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Đăng ký giáo viên" subtitle="Gia nhập mạng lưới giáo viên Tuto." />
      <Section>
        <Card>
          <div className="p-6">
            <p className="text-gray-600">Điền hồ sơ và chúng tôi sẽ phản hồi trong 3-5 ngày làm việc.</p>
            <div className="mt-4"><Button>Ứng tuyển ngay</Button></div>
          </div>
        </Card>
      </Section>
    </main>
  );
}


