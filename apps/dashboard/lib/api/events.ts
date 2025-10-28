// Server-only util: Events listing (placeholder implementation)
// If backend endpoint exists later, replace this with a real fetch

export interface WebEventItem {
  id: string;
  title: string;
  date: string; // ISO
  location?: string;
  type?: 'competition' | 'webinar' | 'community';
}

export async function listEvents(): Promise<{ items: WebEventItem[] }> {
  // In absence of a backend, return safe placeholders; note: add TODO in task doc
  return {
    items: [
      { id: 'evt_1', title: 'Cuộc thi Toán tháng này', date: new Date().toISOString(), type: 'competition' },
      { id: 'evt_2', title: 'Webinar kỹ năng học tập', date: new Date(Date.now() + 86400000).toISOString(), type: 'webinar' },
      { id: 'evt_3', title: 'Cộng đồng đọc sách cuối tuần', date: new Date(Date.now() + 172800000).toISOString(), type: 'community' },
    ],
  };
}





