export type Locale = 'vi' | 'en';
export const LANG_COOKIE = 'tuto_lang';

const vi = {
  // Nav
  'nav.home':     'Trang chủ',
  'nav.products': 'Sản phẩm',
  'nav.about':    'Về chúng tôi',
  'nav.contact':  'Liên hệ',
  'nav.terms':    'Điều khoản',
  'nav.privacy':  'Bảo mật',
  'nav.language': 'EN',
  'nav.tryFree':  'Dùng thử miễn phí',

  // Hero
  'hero.badge':    'Nền tảng giáo dục cho Việt Nam',
  'hero.title':    'Quản lý trường học & cộng đồng học tập trong một nền tảng',
  'hero.subtitle': 'Tuto kết nối phụ huynh, học sinh, giáo viên và nhà trường — từ điểm danh, bài tập, thanh toán đến cộng đồng chia sẻ thành tích.',
  'hero.cta1':     'Miễn phí triển khai cho trường học',
  'hero.cta2':     'Xem cộng đồng trực tiếp',
  'hero.note':     'Hiện đang miễn phí hoàn toàn cho trường học. Số lượng có hạn.',

  // Products
  'products.title':     'Ba sản phẩm — Một hệ sinh thái',
  'products.lms.name':  'School LMS/SIS',
  'products.lms.desc':  'Quản lý điểm danh, thời khóa biểu, bài tập, học phí, sức khỏe và liên lạc phụ huynh — tất cả trong một trang tổng quan dành cho nhà trường.',
  'products.lms.cta':   'Xem dashboard trường',
  'products.community.name': 'Cộng đồng tuto.asia',
  'products.community.desc': 'Mạng xã hội học tập: phụ huynh và giáo viên chia sẻ thành tích, sự kiện và hoạt động của trường — giao diện quen thuộc như Facebook.',
  'products.community.cta':  'Vào cộng đồng',
  'products.courses.name':  'Khóa học trực tuyến',
  'products.courses.desc':  'Giáo viên tạo và bán khóa học ngắn; học sinh truy cập trên mọi thiết bị. Tích hợp sẵn với hồ sơ giáo viên trên cộng đồng.',
  'products.courses.cta':   'pro.tuto.asia',

  // How it works
  'how.title':         'Ai được hưởng lợi?',
  'how.school.title':  'Trường học & Trung tâm',
  'how.school.items':  'Điểm danh số hóa · Thời khóa biểu · Giao tiếp phụ huynh · Thanh toán · Báo cáo học tập · Nhập dữ liệu từ Excel',
  'how.parent.title':  'Phụ huynh & Học sinh',
  'how.parent.items':  'Xem điểm danh & bài tập theo thời gian thực · Nhận thông báo từ trường · Theo dõi tiến bộ · Trao đổi với giáo viên',
  'how.teacher.title': 'Giáo viên',
  'how.teacher.items': 'Hồ sơ công khai trên cộng đồng · Hệ thống Shield/Uy tín · Bảng xếp hạng · Chia sẻ tài liệu và thành tích',
  'how.freelance.title':'Giáo viên tự do',
  'how.freelance.items':'Tạo hồ sơ chuyên môn · Tiếp cận phụ huynh và học sinh · Xây dựng cộng đồng follower · Bán khóa học (sắp ra mắt)',

  // AI section
  'ai.title':    'AI trong Tuto — chỉ những gì thực sự tồn tại',
  'ai.item1':    'Kiểm duyệt nội dung tự động: mỗi bài đăng được AI sàng lọc trước khi hiển thị — không cần quản trị viên duyệt thủ công.',
  'ai.item2':    'Phân loại vai trò thông minh: hệ thống nhận diện loại nội dung (thành tích, sự kiện, thông báo) và gắn nhãn tự động.',
  'ai.roadmap':  'Sắp ra mắt: gợi ý học tập cá nhân hoá theo tiến bộ của từng học sinh.',

  // Lead form
  'form.title':         'Đăng ký triển khai miễn phí',
  'form.subtitle':      'Để lại thông tin — đội ngũ Tuto sẽ liên hệ trong 24 giờ.',
  'form.name':          'Họ và tên *',
  'form.org':           'Tên trường / tổ chức *',
  'form.role':          'Bạn là *',
  'form.role.school':   'Hiệu trưởng / Quản lý trường',
  'form.role.center':   'Giám đốc trung tâm',
  'form.role.teacher':  'Giáo viên',
  'form.role.parent':   'Phụ huynh',
  'form.role.investor': 'Nhà đầu tư',
  'form.role.partner':  'Đối tác',
  'form.role.other':    'Khác',
  'form.email':         'Email',
  'form.phone':         'Số điện thoại',
  'form.message':       'Tin nhắn (tuỳ chọn)',
  'form.submit':        'Gửi đăng ký',
  'form.sending':       'Đang gửi...',
  'form.success':       'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.',
  'form.error':         'Có lỗi xảy ra. Vui lòng thử lại.',

  // Footer
  'footer.tagline':  'learn • connect • grow',
  'footer.products': 'Sản phẩm',
  'footer.company':  'Công ty',
  'footer.contact':  'Liên hệ: hello@tuto.asia',

  // Terms / Privacy titles
  'terms.title':   'Điều khoản Sử dụng',
  'privacy.title': 'Chính sách Bảo mật',
};

const en: typeof vi = {
  'nav.home':     'Home',
  'nav.products': 'Products',
  'nav.about':    'About',
  'nav.contact':  'Contact',
  'nav.terms':    'Terms',
  'nav.privacy':  'Privacy',
  'nav.language': 'VI',
  'nav.tryFree':  'Free Setup',

  'hero.badge':    'EdTech Platform for Vietnam',
  'hero.title':    'School Management & Learning Community in One Platform',
  'hero.subtitle': 'Tuto connects parents, students, teachers and schools — from attendance and homework to payments and a vibrant learning community.',
  'hero.cta1':     'Free Setup for Schools',
  'hero.cta2':     'Explore the Community',
  'hero.note':     'Currently completely free for schools. Limited slots available.',

  'products.title':     'Three Products — One Ecosystem',
  'products.lms.name':  'School LMS/SIS',
  'products.lms.desc':  'Manage attendance, timetables, homework, fees, health records and parent communications — all in one school dashboard.',
  'products.lms.cta':   'View school dashboard',
  'products.community.name': 'tuto.asia Community',
  'products.community.desc': 'An education social network: parents and teachers share achievements, events and school news — familiar Facebook-style interface.',
  'products.community.cta':  'Join the community',
  'products.courses.name':  'Online Courses',
  'products.courses.desc':  'Teachers create and sell short courses; students access on any device. Integrated with teacher profiles on the community.',
  'products.courses.cta':   'pro.tuto.asia',

  'how.title':         'Who benefits?',
  'how.school.title':  'Schools & Centers',
  'how.school.items':  'Digital attendance · Timetables · Parent communication · Payments · Learning reports · Excel data import',
  'how.parent.title':  'Parents & Students',
  'how.parent.items':  'Real-time attendance & homework · School announcements · Progress tracking · Teacher messaging',
  'how.teacher.title': 'Teachers',
  'how.teacher.items': 'Public profile on the community · Shield/Reputation system · Leaderboard · Share materials and achievements',
  'how.freelance.title':'Freelance Teachers',
  'how.freelance.items':'Build a professional profile · Reach parents and students · Grow a follower community · Sell courses (coming soon)',

  'ai.title':    'AI in Tuto — only what actually exists',
  'ai.item1':    'Automated content moderation: every post is AI-screened before going live — no manual admin approval needed.',
  'ai.item2':    'Smart content classification: the system identifies content type (achievement, event, announcement) and auto-tags it.',
  'ai.roadmap':  'Coming soon: personalised learning suggestions based on each student\'s progress.',

  'form.title':         'Register for Free Setup',
  'form.subtitle':      'Leave your details — the Tuto team will get in touch within 24 hours.',
  'form.name':          'Full name *',
  'form.org':           'School / Organisation name *',
  'form.role':          'You are *',
  'form.role.school':   'Principal / School Manager',
  'form.role.center':   'Center Director',
  'form.role.teacher':  'Teacher',
  'form.role.parent':   'Parent',
  'form.role.investor': 'Investor',
  'form.role.partner':  'Partner',
  'form.role.other':    'Other',
  'form.email':         'Email',
  'form.phone':         'Phone',
  'form.message':       'Message (optional)',
  'form.submit':        'Submit Registration',
  'form.sending':       'Sending...',
  'form.success':       'Thank you! We\'ll be in touch as soon as possible.',
  'form.error':         'Something went wrong. Please try again.',

  'footer.tagline':  'learn • connect • grow',
  'footer.products': 'Products',
  'footer.company':  'Company',
  'footer.contact':  'Contact: hello@tuto.asia',

  'terms.title':   'Terms of Use',
  'privacy.title': 'Privacy Policy',
};

export type TKey = keyof typeof vi;

const dict: Record<Locale, typeof vi> = { vi, en };

export function t(locale: Locale, key: TKey): string {
  return dict[locale]?.[key] ?? dict.vi[key] ?? key;
}
