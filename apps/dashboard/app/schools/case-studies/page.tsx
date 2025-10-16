import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { listCaseStudies } from '../../../lib/api/schools';

export default async function CaseStudiesPage() {
  const data = await listCaseStudies();
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Case study</h1>
      <p className="mt-2 text-gray-600">Câu chuyện thành công từ các trường.</p>
      <section className="grid gap-6 mt-6">
        {items.map((it) => (
          <Card key={it.id}><div className="p-6"><div className="text-lg font-medium">{it.title}</div><div className="text-sm text-gray-600 mt-1">{it.summary}</div></div></Card>
        ))}
      </section>
    </main>
  );
}


