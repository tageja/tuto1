import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function SafeguardingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">An toàn học đường</h1>
      <p className="mt-2 text-gray-600">Chuẩn bảo vệ học sinh và môi trường học.</p>
      <Card>
        <div className="p-6 mt-6">
          <ul className="list-disc pl-5 text-gray-600">
            <li>Kiểm tra lý lịch và xác minh giáo viên</li>
            <li>Quy trình báo cáo và xử lý sự cố</li>
            <li>Bảo vệ dữ liệu cá nhân</li>
          </ul>
        </div>
      </Card>
    </main>
  );
}



