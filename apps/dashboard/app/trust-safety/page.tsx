import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

export default function TrustSafetyPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Tin cậy & An toàn" subtitle="Quy trình xác minh, tiêu chuẩn cộng đồng và bảo vệ dữ liệu." />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">Xác minh</h2>
              <p className="mt-2 text-gray-600">Kiểm tra hồ sơ giáo viên, bằng cấp và lịch sử hoạt động.</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">Bảo vệ dữ liệu</h2>
              <p className="mt-2 text-gray-600">Mã hóa, phân quyền truy cập và giám sát bảo mật.</p>
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}

