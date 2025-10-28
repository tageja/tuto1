import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function CodeOfConductPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Quy tắc ứng xử</h1>
      <p className="mt-2 text-gray-600">Môi trường học tôn trọng và tích cực.</p>
      <Card>
        <div className="p-6 mt-6">
          <ul className="list-disc pl-5 text-gray-600">
            <li>Tôn trọng giáo viên và bạn học</li>
            <li>Không gian học an toàn, không bạo lực</li>
            <li>Trung thực trong học tập</li>
          </ul>
        </div>
      </Card>
    </main>
  );
}





