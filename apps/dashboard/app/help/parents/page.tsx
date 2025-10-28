import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';

export default function HelpParentsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Trợ giúp cho phụ huynh</h1>
      <p className="mt-2 text-gray-600">Câu hỏi thường gặp và hướng dẫn nhanh.</p>
      <Card>
        <div className="p-6 mt-6">
          <h2 className="text-xl font-medium">Câu hỏi thường gặp</h2>
          <ul className="list-disc pl-5 mt-2 text-gray-600">
            <li>Cách tìm giáo viên phù hợp?</li>
            <li>Làm sao đặt buổi học thử?</li>
            <li>Chính sách hoàn tiền?</li>
          </ul>
        </div>
      </Card>
    </main>
  );
}






