import type { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Tìm kiếm | tuto.social',
};

// Community-first: search is public. Querying runs client-side in
// SearchPageClient (anon-read RLS); interactions are auth-gated there.
export default function SearchPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Tìm kiếm</h1>
      <SearchPageClient />
    </main>
  );
}
