// Server-only utils for Schools features (placeholder implementations)
// Replace with real backend calls when available

export interface SchoolKpi {
  label: string;
  value: string;
}

export async function getSchoolAnalytics(): Promise<{ kpis: SchoolKpi[] }> {
  return {
    kpis: [
      { label: 'Học sinh hoạt động', value: '1,250' },
      { label: 'Lớp trong tuần', value: '240' },
      { label: 'Tỷ lệ chuyên cần', value: '96%' },
      { label: 'Doanh thu MTD', value: '₫1.2B' },
    ],
  };
}

export async function listCaseStudies(): Promise<{ items: Array<{ id: string; title: string; summary: string }> }> {
  return {
    items: [
      { id: 'cs_1', title: 'Trường A tăng 30% hiệu suất', summary: 'Ứng dụng lịch, đánh giá và phân tích.' },
      { id: 'cs_2', title: 'Trường B chuẩn hoá giáo án', summary: 'Lập kế hoạch bài học và báo cáo.' },
    ],
  };
}

export async function getSchoolPricing(): Promise<{ tiers: Array<{ name: string; price: string; features: string[] }> }> {
  return {
    tiers: [
      { name: 'Starter', price: 'Liên hệ', features: ['Quản lý cơ bản', 'Hỗ trợ email'] },
      { name: 'Growth', price: '₫5M/tháng', features: ['Phân tích', 'Lập kế hoạch', 'Ưu tiên hỗ trợ'] },
      { name: 'Enterprise', price: 'Theo nhu cầu', features: ['Tùy biến sâu', 'SLA'] },
    ],
  };
}





