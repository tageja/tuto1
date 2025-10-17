import '../../globals.css';
import { Card } from '../../../components/ui/Card';

async function getData() {
  const base = process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || '';
  const url = `${base}/api/schools/lesson-planner`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { upcomingAssignments: [], classSubjects: [], error: `HTTP ${res.status}` } as any;
    return (await res.json()) as {
      upcomingAssignments: Array<{ id: string; title: string; className?: string; subject?: string; description?: string; dueDate?: string; totalStudents?: number; submittedCount?: number; status?: string }>;
      classSubjects: Array<{ id: string; name?: string; className?: string; subject?: string; enabled?: boolean }>;
    };
  } catch (e: any) {
    return { upcomingAssignments: [], classSubjects: [], error: e?.message } as any;
  }
}

export default async function LessonPlannerPage() {
  const data = await getData();
  const upcoming = Array.isArray(data.upcomingAssignments) ? data.upcomingAssignments : [];
  const subjects = Array.isArray(data.classSubjects) ? data.classSubjects : [];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Lập kế hoạch bài học</h1>
      <p className="mt-2 text-gray-600">Soạn giáo án và phân phối nội dung.</p>

      {/* Upcoming Assignments */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Bài tập sắp đến hạn</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-3">
          {upcoming.length === 0 && (
            <Card><div className="p-6">Không có bài tập sắp đến hạn.</div></Card>
          )}
          {upcoming.map((a) => (
            <Card key={a.id}>
              <div className="p-6">
                <div className="text-lg font-medium">{a.title || 'Bài tập'}</div>
                <div className="text-sm text-gray-600 mt-1">{a.className || 'Lớp'} • {a.subject || 'Môn học'}</div>
                {a.dueDate && (<div className="text-sm mt-2">Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</div>)}
                {typeof a.totalStudents === 'number' && (
                  <div className="text-sm text-gray-700 mt-1">Nộp: {a.submittedCount ?? 0}/{a.totalStudents}</div>
                )}
                {a.status && (<div className="text-xs text-gray-500 mt-1">Trạng thái: {a.status}</div>)}
                {a.description && (<p className="text-sm text-gray-700 mt-2 line-clamp-3">{a.description}</p>)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Class Subjects */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Môn học theo lớp</h2>
        <div className="grid gap-4 md:grid-cols-3 mt-3">
          {subjects.length === 0 && (
            <Card><div className="p-6">Chưa có cấu hình môn học theo lớp.</div></Card>
          )}
          {subjects.map((s) => (
            <Card key={s.id}>
              <div className="p-6">
                <div className="text-lg font-medium">{s.name || s.subject || 'Môn học'}</div>
                <div className="text-sm text-gray-600 mt-1">{s.className || 'Lớp'}</div>
                <div className="text-xs text-gray-500 mt-1">{s.enabled ? 'Bật' : 'Tắt'}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}


