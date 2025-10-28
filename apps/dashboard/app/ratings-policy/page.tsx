import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function RatingsPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Chính sách đánh giá</h1>
      <p className="mt-2 text-gray-600">Hướng dẫn đánh giá công bằng và hữu ích.</p>
      <Card>
        <div className="p-6 mt-6">
          <ul className="list-disc pl-5 text-gray-600">
            <li>Tôn trọng và trung thực</li>
            <li>Nội dung liên quan đến buổi học</li>
            <li>Không vi phạm điều khoản</li>
          </ul>
        </div>
      </Card>
    </main>
  );
}






