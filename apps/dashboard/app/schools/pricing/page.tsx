import '../../globals.css';
import { Card } from '../../../components/ui/Card';
import { getSchoolPricing } from '../../../lib/api/schools';

export default async function SchoolsPricingPage() {
  const data = await getSchoolPricing();
  const tiers = Array.isArray(data.tiers) ? data.tiers : [];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Bảng giá cho trường</h1>
      <p className="mt-2 text-gray-600">Gói và mức giá cho tổ chức.</p>
      <section className="grid gap-6 md:grid-cols-3 mt-6">
        {tiers.map((t) => (
          <Card key={t.name}>
            <div className="p-6">
              <div className="text-lg font-medium">{t.name}</div>
              <div className="text-2xl font-semibold mt-2">{t.price}</div>
              <ul className="mt-3 list-disc pl-5 text-gray-600">
                {t.features.map((f) => (<li key={f}>{f}</li>))}
              </ul>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}


