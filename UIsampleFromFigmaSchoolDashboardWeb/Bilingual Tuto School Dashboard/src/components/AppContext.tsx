import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';
type Theme = 'light' | 'dark';
type Role = 'admin' | 'parent';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  role: Role;
  setRole: (role: Role) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    dailyActivities: 'Daily Activities',
    announcements: 'Announcements',
    messages: 'Messages',
    photoAlbums: 'Photo Albums',
    classes: 'Classes',
    teachers: 'Teachers',
    attendance: 'Attendance',
    homework: 'Homework',
    progressReports: 'Progress Reports',
    events: 'Events',
    payments: 'Payments',
    health: 'Health',
    extracurricular: 'Extracurricular',
    settings: 'Settings',
    library: 'Library & Stories',
    
    // Common
    search: 'Search...',
    comingSoon: 'Coming Soon',
    syncedAgo: 'Synced 2 min ago',
    viewAll: 'View All',
    addNew: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    export: 'Export',
    filter: 'Filter',
    
    // Dashboard
    totalStudents: 'Total Students',
    activeTeachers: 'Active Teachers',
    attendanceRate: 'Attendance Rate',
    upcomingEvents: 'Upcoming Events',
    feeCollection: 'Fee Collection',
    averageRating: 'Average Rating',
    recentAnnouncements: 'Recent Announcements',
    unreadMessages: 'Unread Messages',
    upcomingHomework: 'Upcoming Homework',
    aiInsights: 'AI Insights',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    urgent: 'Urgent',
    normal: 'Normal',
    high: 'High',
    low: 'Low',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    paid: 'Paid',
    overdue: 'Overdue',
    
    // Brand
    tagline: 'learn • connect • grow',
    copyright: '© Tuto — learn • connect • grow',
  },
  vi: {
    // Navigation
    dashboard: 'Bảng điều khiển',
    dailyActivities: 'Hoạt động hàng ngày',
    announcements: 'Thông báo',
    messages: 'Tin nhắn',
    photoAlbums: 'Album ảnh',
    classes: 'Lớp học',
    teachers: 'Giáo viên',
    attendance: 'Điểm danh',
    homework: 'Bài tập',
    progressReports: 'Báo cáo tiến độ',
    events: 'Sự kiện',
    payments: 'Thanh toán',
    health: 'Sức khỏe',
    extracurricular: 'Ngoại khóa',
    settings: 'Cài đặt',
    library: 'Thư viện & Truyện',
    
    // Common
    search: 'Tìm kiếm...',
    comingSoon: 'Sắp ra mắt',
    syncedAgo: 'Đã đồng bộ 2 phút trước',
    viewAll: 'Xem tất cả',
    addNew: 'Thêm mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    close: 'Đóng',
    export: 'Xuất',
    filter: 'Lọc',
    
    // Dashboard
    totalStudents: 'Tổng học sinh',
    activeTeachers: 'Giáo viên hoạt động',
    attendanceRate: 'Tỷ lệ điểm danh',
    upcomingEvents: 'Sự kiện sắp tới',
    feeCollection: 'Thu phí',
    averageRating: 'Đánh giá trung bình',
    recentAnnouncements: 'Thông báo gần đây',
    unreadMessages: 'Tin nhắn chưa đọc',
    upcomingHomework: 'Bài tập sắp tới',
    aiInsights: 'Phân tích AI',
    
    // Status
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    pending: 'Chờ xử lý',
    completed: 'Hoàn thành',
    urgent: 'Khẩn cấp',
    normal: 'Bình thường',
    high: 'Cao',
    low: 'Thấp',
    present: 'Có mặt',
    absent: 'Vắng mặt',
    late: 'Muộn',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    
    // Brand
    tagline: 'học • kết nối • phát triển',
    copyright: '© Tuto — học • kết nối • phát triển',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [role, setRole] = useState<Role>('admin');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, role, setRole, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
