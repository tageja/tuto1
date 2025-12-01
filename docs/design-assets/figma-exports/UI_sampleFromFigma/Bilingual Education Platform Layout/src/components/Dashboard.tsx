import { useLanguage } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Users, 
  Star, 
  MessageCircle,
  HelpCircle,
  Plus,
  School,
  GraduationCap,
  TrendingUp,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: '2,847',
      label: t('Active Teachers', 'Giáo viên hoạt động'),
      color: 'bg-blue-500'
    },
    {
      icon: Calendar,
      value: '156',
      label: t('Upcoming Classes', 'Lớp sắp diễn ra'),
      color: 'bg-purple-500'
    },
    {
      icon: MessageCircle,
      value: '892',
      label: t('Community Posts', 'Bài viết cộng đồng'),
      color: 'bg-green-500'
    },
    {
      icon: Star,
      value: '4.8',
      label: t('Average Rating', 'Đánh giá trung bình'),
      color: 'bg-yellow-500'
    }
  ];

  const features = [
    {
      icon: Search,
      title: t('Find Teacher', 'Tìm giáo viên'),
      description: t(
        'Browse verified educators across subjects',
        'Duyệt các giáo viên đã xác minh theo môn học'
      ),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: t('Manage Bookings', 'Quản lý đặt lịch'),
      description: t(
        'Schedule and track your sessions',
        'Lên lịch và theo dõi các buổi học'
      ),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CreditCard,
      title: t('Secure Payments', 'Thanh toán an toàn'),
      description: t(
        'Safe transactions with multiple methods',
        'Giao dịch an toàn với nhiều phương thức'
      ),
      color: 'from-green-500 to-green-600'
    }
  ];

  const footerSections = [
    {
      title: t('For Students', 'Dành cho học sinh'),
      links: [
        t('Find Tutors', 'Tìm gia sư'),
        t('Book Classes', 'Đặt lớp học'),
        t('Study Materials', 'Tài liệu học tập'),
        t('Progress Tracking', 'Theo dõi tiến độ')
      ]
    },
    {
      title: t('For Teachers', 'Dành cho giáo viên'),
      links: [
        t('Become a Tutor', 'Trở thành gia sư'),
        t('Create Profile', 'Tạo hồ sơ'),
        t('Teaching Tools', 'Công cụ giảng dạy'),
        t('Earnings', 'Thu nhập')
      ]
    },
    {
      title: t('For Schools', 'Dành cho trường học'),
      links: [
        t('Partner Program', 'Chương trình đối tác'),
        t('School Dashboard', 'Bảng điều khiển trường'),
        t('Bulk Bookings', 'Đặt hàng loạt'),
        t('Analytics', 'Phân tích')
      ]
    },
    {
      title: t('Company', 'Công ty'),
      links: [
        t('About Us', 'Về chúng tôi'),
        t('Contact', 'Liên hệ'),
        t('Careers', 'Tuyển dụng'),
        t('Blog', 'Blog')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <h1
                className="text-3xl tracking-tight"
                style={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Tuto
              </h1>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-foreground hover:text-primary transition-colors">
                  {t('Home', 'Trang chủ')}
                </a>
                <a href="#" className="text-sm text-foreground hover:text-primary transition-colors">
                  {t('Find Teachers', 'Tìm giáo viên')}
                </a>
                <a href="#" className="text-sm text-foreground hover:text-primary transition-colors">
                  {t('Classes', 'Lớp học')}
                </a>
                <a href="#" className="text-sm text-foreground hover:text-primary transition-colors">
                  {t('Community', 'Cộng đồng')}
                </a>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Help', 'Trợ giúp')}</span>
              </Button>
              <LanguageToggle />
              <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('New Booking', 'Đặt lịch mới')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6 text-foreground">
                {t(
                  'Connect with the best educators',
                  'Kết nối với những nhà giáo dục tốt nhất'
                )}
              </h1>
              <p className="mb-8 text-muted-foreground max-w-xl">
                {t(
                  'Tuto brings together teachers, parents, and schools on one platform. Find qualified tutors, schedule classes, and track progress all in one place.',
                  'Tuto kết nối giáo viên, phụ huynh và trường học trên một nền tảng. Tìm gia sư có trình độ, lên lịch học và theo dõi tiến độ tất cả ở một nơi.'
                )}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl gap-2">
                  <Search className="w-5 h-5" />
                  {t('Find a Teacher', 'Tìm giáo viên')}
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {t('Become a Tutor', 'Trở thành gia sư')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1590479773265-7464e5d48118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb24lMjBjb25uZWN0aW9uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MDkzNjQwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Education Platform"
                className="relative w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </motion.section>

        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground mb-2">{stat.label}</p>
                    <h3 className="text-foreground">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl text-white`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Feature Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="mb-4 text-foreground">
              {t('Everything you need', 'Mọi thứ bạn cần')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                'Powerful features designed for modern education',
                'Các tính năng mạnh mẽ được thiết kế cho giáo dục hiện đại'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* How it Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="p-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-foreground">
                {t('How Tuto Works', 'Tuto hoạt động như thế nào')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t(
                  'Get started in three simple steps',
                  'Bắt đầu chỉ với ba bước đơn giản'
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h4 className="mb-2 text-foreground">
                  {t('Create Profile', 'Tạo hồ sơ')}
                </h4>
                <p className="text-muted-foreground">
                  {t(
                    'Sign up and complete your profile in minutes',
                    'Đăng ký và hoàn thành hồ sơ của bạn trong vài phút'
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h4 className="mb-2 text-foreground">
                  {t('Find & Connect', 'Tìm & Kết nối')}
                </h4>
                <p className="text-muted-foreground">
                  {t(
                    'Browse teachers and book your first session',
                    'Duyệt giáo viên và đặt buổi học đầu tiên'
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h4 className="mb-2 text-foreground">
                  {t('Start Learning', 'Bắt đầu học')}
                </h4>
                <p className="text-muted-foreground">
                  {t(
                    'Join live classes and track your progress',
                    'Tham gia lớp trực tuyến và theo dõi tiến độ'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="p-12 bg-gradient-to-br from-primary to-secondary text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white" />
            </div>
            <div className="relative z-10">
              <h2 className="mb-4 text-white">
                {t('Ready to get started?', 'Sẵn sàng bắt đầu?')}
              </h2>
              <p className="mb-8 text-white/90 max-w-2xl mx-auto">
                {t(
                  'Join thousands of students and teachers already using Tuto',
                  'Tham gia cùng hàng nghìn học sinh và giáo viên đang sử dụng Tuto'
                )}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" className="rounded-xl">
                  {t('Get Started Free', 'Bắt đầu miễn phí')}
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl border-white text-white hover:bg-white/10">
                  {t('Contact Sales', 'Liên hệ bán hàng')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Logo Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h1
                className="text-3xl tracking-tight mb-4"
                style={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Tuto
              </h1>
              <p className="text-muted-foreground mb-4">
                {t(
                  'Making education accessible for everyone',
                  'Giúp giáo dục dễ tiếp cận cho mọi người'
                )}
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="mb-4 text-foreground">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Tuto. {t('All rights reserved.', 'Đã đăng ký bản quyền.')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {t('Privacy Policy', 'Chính sách bảo mật')}
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {t('Terms of Service', 'Điều khoản dịch vụ')}
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {t('Cookie Policy', 'Chính sách cookie')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
