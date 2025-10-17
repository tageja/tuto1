import '../../globals.css';
import { Card } from '../../../components/ui/Card';

async function getData() {
  const base = process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || '';
  const url = `${base}/api/schools/assessments`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { reports: [], error: `HTTP ${res.status}` } as any;
    return (await res.json()) as {
      reports: Array<{ id: string; studentName?: string; className?: string; subject?: string; grade?: string | number; percentage?: number; term?: string; reportDate?: string; teacherComments?: string }>;
    };
  } catch (e: any) {
    return { reports: [], error: e?.message } as any;
  }
}

export default async function AssessmentsPage() {
  const data = await getData();
  const reports = Array.isArray(data.reports) ? data.reports : [];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Đánh giá</h1>
      <p className="mt-2 text-gray-600">Bài kiểm tra, bài tập và chuẩn đầu ra.</p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Báo cáo tiến độ gần đây</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-3">
          {reports.length === 0 && (
            <Card><div className="p-6">Chưa có báo cáo tiến độ gần đây.</div></Card>
          )}
          {reports.map((r) => (
            <Card key={r.id}>
              <div className="p-6">
                <div className="text-lg font-medium">{r.studentName || 'Học sinh'}</div>
                <div className="text-sm text-gray-600 mt-1">{r.className || 'Lớp'} • {r.subject || 'Môn học'}</div>
                <div className="text-sm mt-2">Điểm: {typeof r.grade !== 'undefined' ? r.grade : (typeof r.percentage === 'number' ? `${r.percentage}%` : '—')}</div>
                {r.term && (<div className="text-xs text-gray-500 mt-1">Kỳ: {r.term}</div>)}
                {r.reportDate && (<div className="text-xs text-gray-500 mt-1">Ngày: {new Date(r.reportDate).toLocaleDateString('vi-VN')}</div>)}
                {r.teacherComments && (<p className="text-sm text-gray-700 mt-2 line-clamp-3">{r.teacherComments}</p>)}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}


