import { useLanguage } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Progress } from './ui/progress';
import {
  Download,
  Calendar,
  Mail,
  Globe,
  School,
  Users,
  GraduationCap,
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  CheckCircle2,
  Award,
  BarChart3,
  Lightbulb,
  Heart,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export function InvestorPage() {
  const { t } = useLanguage();

  const problemPoints = [
    {
      icon: School,
      title: t('Disconnected Systems', 'Hệ thống rời rạc'),
      description: t(
        'Schools lack integrated platforms',
        'Trường học thiếu nền tảng tích hợp'
      )
    },
    {
      icon: DollarSign,
      title: t('Inefficient Fee Tracking', 'Theo dõi học phí kém'),
      description: t(
        'Manual processes cause delays',
        'Quy trình thủ công gây chậm trễ'
      )
    },
    {
      icon: Brain,
      title: t('Non-Adaptive Learning', 'Học tập không linh hoạt'),
      description: t(
        'One-size-fits-all approach',
        'Cách tiếp cận đồng nhất'
      )
    },
    {
      icon: MessageCircle,
      title: t('Limited Communication', 'Giao tiếp hạn chế'),
      description: t(
        'Fragmented parent-teacher connection',
        'Kết nối phụ huynh-giáo viên rời rạc'
      )
    }
  ];

  const solutionPillars = [
    {
      icon: School,
      title: t('For Schools', 'Dành cho trường'),
      description: t(
        'Centralized dashboards, analytics, and comprehensive reporting',
        'Bảng điều khiển tập trung, phân tích và báo cáo toàn diện'
      ),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: GraduationCap,
      title: t('For Teachers', 'Dành cho giáo viên'),
      description: t(
        'CRM tools, scheduling, adaptive homework, and feedback systems',
        'Công cụ CRM, lên lịch, bài tập thích ứng và hệ thống phản hồi'
      ),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: t('For Parents', 'Dành cho phụ huynh'),
      description: t(
        'Real-time student progress, fee tracking, and seamless communication',
        'Tiến độ học sinh thời gian thực, theo dõi học phí và giao tiếp liền mạch'
      ),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Brain,
      title: t('Powered by AI', 'Được hỗ trợ bởi AI'),
      description: t(
        'Personalized learning paths, predictive insights, and smart recommendations',
        'Lộ trình học tập cá nhân hóa, thông tin dự đoán và đề xuất thông minh'
      ),
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const roadmapPhases = [
    {
      phase: t('Idea & R&D', 'Ý tưởng & R&D'),
      timeframe: t('June–Nov 2024', 'Tháng 6–11/2024'),
      milestone: t(
        'MVP design, architecture, brand setup',
        'Thiết kế MVP, kiến trúc, thiết lập thương hiệu'
      ),
      progress: 100,
      status: 'completed'
    },
    {
      phase: t('Pilot Launch', 'Ra mắt thử nghiệm'),
      timeframe: t('Dec 2025', 'Tháng 12/2025'),
      milestone: t(
        'Launch with 2 partner schools, onboard 100+ students',
        'Ra mắt với 2 trường đối tác, 100+ học sinh'
      ),
      progress: 75,
      status: 'in-progress'
    },
    {
      phase: t('Early Expansion', 'Mở rộng sớm'),
      timeframe: t('Jun 2026', 'Tháng 6/2026'),
      milestone: t(
        '6–7 schools onboarded, ~700 students, CRM + adaptive homework rollout',
        '6–7 trường tham gia, ~700 học sinh, triển khai CRM + bài tập thích ứng'
      ),
      progress: 40,
      status: 'in-progress'
    },
    {
      phase: t('Public Beta', 'Phiên bản Beta công khai'),
      timeframe: t('Sep 2026', 'Tháng 9/2026'),
      milestone: t(
        'Open to all users, add social feed, teacher profiles',
        'Mở cho tất cả người dùng, thêm nguồn cấp xã hội, hồ sơ giáo viên'
      ),
      progress: 10,
      status: 'planned'
    },
    {
      phase: t('Freelance Network Growth', 'Phát triển mạng lưới freelance'),
      timeframe: t('2027', '2027'),
      milestone: t(
        'Nationwide expansion, marketplace for teachers and institutes',
        'Mở rộng toàn quốc, thị trường cho giáo viên và trung tâm'
      ),
      progress: 0,
      status: 'planned'
    }
  ];

  const marketStats = [
    {
      value: '$404B',
      label: t('Global EdTech Market by 2027', 'Thị trường EdTech toàn cầu đến 2027')
    },
    {
      value: '12M',
      label: t('Students in Vietnam K-12', 'Học sinh K-12 tại Việt Nam')
    },
    {
      value: '85%',
      label: t('Digital Adoption Post-COVID', 'Ứng dụng kỹ thuật số sau COVID')
    }
  ];

  const businessModels = [
    {
      icon: School,
      title: t('Schools (B2B SaaS)', 'Trường học (B2B SaaS)'),
      description: t(
        'Subscription per student, annual or multi-year plans',
        'Đăng ký theo học sinh, gói hàng năm hoặc nhiều năm'
      ),
      pricing: t('$5-15 per student/month', '$5-15/học sinh/tháng')
    },
    {
      icon: GraduationCap,
      title: t('Freelance Teachers (B2C SaaS)', 'Giáo viên tự do (B2C SaaS)'),
      description: t(
        '10–15% commission on all bookings',
        'Hoa hồng 10–15% trên tất cả các đặt chỗ'
      ),
      pricing: t('Commission-based', 'Dựa trên hoa hồng')
    },
    {
      icon: Users,
      title: t('Parents (Freemium)', 'Phụ huynh (Freemium)'),
      description: t(
        'Free access + optional premium analytics and insights',
        'Truy cập miễn phí + phân tích và thông tin chi tiết cao cấp tùy chọn'
      ),
      pricing: t('Free / $3-5 premium', 'Miễn phí / $3-5 cao cấp')
    }
  ];

  const tractionMetrics = [
    {
      icon: Target,
      value: '2',
      label: t('Schools Onboarded', 'Trường đã tham gia'),
      sublabel: t('(Dec 2025)', '(Tháng 12/2025)')
    },
    {
      icon: Users,
      value: '700+',
      label: t('Students Target', 'Mục tiêu học sinh'),
      sublabel: t('(June 2026)', '(Tháng 6/2026)')
    },
    {
      icon: TrendingUp,
      value: '80%',
      label: t('Parent Engagement', 'Tương tác phụ huynh'),
      sublabel: t('(Projected)', '(Dự kiến)')
    },
    {
      icon: Award,
      value: '4.9',
      label: t('Pilot Satisfaction', 'Hài lòng thử nghiệm'),
      sublabel: t('(Early feedback)', '(Phản hồi sớm)')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
              <Badge variant="secondary" className="hidden sm:flex gap-1">
                <Zap className="w-3 h-3" />
                {t('For Investors', 'Dành cho nhà đầu tư')}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Button size="sm" variant="outline" className="gap-2 rounded-xl hidden sm:flex">
                <Download className="w-4 h-4" />
                {t('Investor Deck', 'Tài liệu đầu tư')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* 1. Hero Section - Vision + Elevator Pitch */}
        <section className="relative overflow-hidden">
          {/* Background with Tuto watermark */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl"
              style={{
                fontWeight: 700,
                color: '#0B5FFF'
              }}
            >
              Tuto
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  {t('Pre-Seed Investment Opportunity', 'Cơ hội đầu tư Pre-Seed')}
                </Badge>
                <h1 className="mb-6 text-foreground">
                  {t(
                    'Empowering every school, teacher, and learner — powered by AI and data',
                    'Trao quyền cho mọi trường học, giáo viên và người học — được hỗ trợ bởi AI và dữ liệu'
                  )}
                </h1>
                <p className="mb-8 text-muted-foreground max-w-xl">
                  {t(
                    'Tuto is building the next-generation education ecosystem — connecting schools, parents, and teachers with smart learning tools and real-time insights.',
                    'Tuto đang xây dựng hệ sinh thái giáo dục thế hệ tiếp theo — kết nối trường học, phụ huynh và giáo viên với các công cụ học tập thông minh và thông tin chi tiết thời gian thực.'
                  )}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl gap-2">
                    <Download className="w-5 h-5" />
                    {t('Download Investor Deck', 'Tải tài liệu đầu tư')}
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('Book a 20-min founder chat', 'Đặt cuộc trò chuyện 20 phút với người sáng lập')}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl" />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1579864795584-092b04e14e67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHZpc2lvbiUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzYxMDI4OTUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Vision"
                  className="relative w-full h-auto rounded-3xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. The Problem & Opportunity */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('The Problem & Opportunity', 'Vấn đề & Cơ hội')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
                {t(
                  'Education in Southeast Asia is growing rapidly, yet fragmented. Schools and parents struggle with student progress tracking, teacher coordination, and adaptive learning support. Tuto bridges this gap — creating one connected platform for schools, teachers, and families.',
                  'Giáo dục ở Đông Nam Á đang phát triển nhanh chóng, nhưng vẫn phân tán. Các trường học và phụ huynh gặp khó khăn với việc theo dõi tiến độ học sinh, phối hợp giáo viên và hỗ trợ học tập thích ứng. Tuto thu hẹp khoảng cách này — tạo ra một nền tảng được kết nối cho trường học, giáo viên và gia đình.'
                )}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                      <point.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="mb-2 text-foreground">{point.title}</h4>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. The Solution - What Tuto Offers */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('The Solution — What Tuto Offers', 'Giải pháp — Tuto cung cấp gì')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'A comprehensive platform designed to connect and empower all stakeholders in education',
                  'Một nền tảng toàn diện được thiết kế để kết nối và trao quyền cho tất cả các bên liên quan trong giáo dục'
                )}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759820941220-fed6a1010146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwZGV2aWNlfGVufDF8fHx8MTc2MTAyODk1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Product"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </motion.div>

              <div className="space-y-6">
                {solutionPillars.map((pillar, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center flex-shrink-0`}>
                          <pillar.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="mb-2 text-foreground">{pillar.title}</h4>
                          <p className="text-sm text-muted-foreground">{pillar.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Roadmap / Timeline */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('Roadmap & Milestones', 'Lộ trình & Cột mốc')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'Clear trajectory from concept to scale',
                  'Quỹ đạo rõ ràng từ khái niệm đến quy mô'
                )}
              </p>
            </motion.div>

            <div className="space-y-8">
              {roadmapPhases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-border/50">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-foreground">{phase.phase}</h4>
                          {phase.status === 'completed' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('Completed', 'Hoàn thành')}
                            </Badge>
                          )}
                          {phase.status === 'in-progress' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                              <Zap className="w-3 h-3 mr-1" />
                              {t('In Progress', 'Đang thực hiện')}
                            </Badge>
                          )}
                          {phase.status === 'planned' && (
                            <Badge variant="outline">
                              {t('Planned', 'Kế hoạch')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{phase.timeframe}</p>
                        <p className="text-sm text-foreground">{phase.milestone}</p>
                      </div>
                      <div className="lg:w-64">
                        <div className="flex items-center gap-3">
                          <Progress value={phase.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground min-w-[3rem]">
                            {phase.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Market Potential */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('Market Potential', 'Tiềm năng thị trường')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'A fast-growing market. A scalable model. A first-mover advantage.',
                  'Một thị trường phát triển nhanh. Một mô hình có thể mở rộng. Lợi thế người đi đầu.'
                )}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1742415105376-43d3a5fd03fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGdsb2JhbCUyMG9wcG9ydHVuaXR5fGVufDF8fHx8MTc2MTAyODk1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Global Market"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </motion.div>

              <div className="space-y-6">
                {marketStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl text-primary">{stat.value}</div>
                        <p className="text-foreground">{stat.label}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pt-6"
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-border/50">
                    <div className="flex items-start gap-3">
                      <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="mb-2 text-foreground">
                          {t('Southeast Asia Focus', 'Tập trung Đông Nam Á')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            'Starting with Vietnam, expanding to Thailand, Indonesia, and the Philippines — markets with high digital adoption and educational spending growth.',
                            'Bắt đầu với Việt Nam, mở rộng sang Thái Lan, Indonesia và Philippines — các thị trường có tốc độ áp dụng kỹ thuật số cao và tăng trưởng chi tiêu giáo dục.'
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Business Model */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('Business Model', 'Mô hình kinh doanh')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'Multiple revenue streams with clear path to profitability',
                  'Nhiều dòng doanh thu với con đường rõ ràng đến lợi nhuận'
                )}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {businessModels.map((model, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <model.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="mb-2 text-foreground">{model.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      {model.pricing}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="mb-2 text-foreground">
                      {t('Long-term Vision', 'Tầm nhìn dài hạn')}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        'Data analytics + AI subscription model for adaptive learning content. As we scale, we unlock new revenue opportunities through premium insights, content marketplace, and enterprise solutions.',
                        'Mô hình đăng ký phân tích dữ liệu + AI cho nội dung học tập thích ứng. Khi chúng tôi mở rộng quy mô, chúng tôi mở khóa các cơ hội doanh thu mới thông qua thông tin chi tiết cao cấp, thị trường nội dung và giải pháp doanh nghiệp.'
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* 7. Traction & Early Interest */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('Traction & Early Interest', 'Sức hút & Quan tâm sớm')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'Real momentum from pilot schools and early adopters',
                  'Động lực thực sự từ các trường thử nghiệm và những người áp dụng sớm'
                )}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tractionMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <metric.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-4xl mb-2 text-foreground">{metric.value}</div>
                    <p className="text-sm text-foreground mb-1">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-primary/20">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-primary" />
                      <h4 className="text-foreground">
                        {t('Pilot School Testimonial', 'Lời chứng thực từ trường thử nghiệm')}
                      </h4>
                    </div>
                    <blockquote className="italic text-foreground mb-4">
                      "{t(
                        'Tuto makes school operations smoother and transparent — we\'re excited to join the pilot.',
                        'Tuto làm cho hoạt động của trường mượt mà và minh bạch hơn — chúng tôi rất vui mừng tham gia thử nghiệm.'
                      )}"
                    </blockquote>
                    <p className="text-sm text-muted-foreground">
                      — {t('Principal, Da Nang Private School', 'Hiệu trưởng, Trường tư thục Đà Nẵng')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-primary" />
                      <h4 className="text-foreground">
                        {t('Partner Schools', 'Trường đối tác')}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mr-2">
                        {t('Apollo English Center', 'Trung tâm Apollo English')}
                      </Badge>
                      <Badge variant="outline" className="mr-2">
                        {t('Partner School #2 (NDA)', 'Trường đối tác #2 (NDA)')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* 8. Team & Advisors */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="mb-6 text-foreground">
                {t('Team & Advisors', 'Đội ngũ & Cố vấn')}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  'We combine 10+ years of education management and modern AI tech to create scalable social impact',
                  'Chúng tôi kết hợp hơn 10 năm quản lý giáo dục và công nghệ AI hiện đại để tạo ra tác động xã hội có thể mở rộng'
                )}
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-border/50 mb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl text-white">TT</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="mb-2 text-foreground">Tarun Tageja</h3>
                      <p className="text-primary mb-3">
                        {t('Founder & CEO', 'Người sáng lập & CEO')}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        {t(
                          '10+ years of academic management experience at Apollo English. Deep understanding of education operations, parent relationships, and teacher development.',
                          'Hơn 10 năm kinh nghiệm quản lý học thuật tại Apollo English. Hiểu biết sâu sắc về hoạt động giáo dục, mối quan hệ với phụ huynh và phát triển giáo viên.'
                        )}
                      </p>
                      <div className="flex gap-2 justify-center md:justify-start">
                        <Badge variant="secondary">
                          {t('Education', 'Giáo dục')}
                        </Badge>
                        <Badge variant="secondary">
                          {t('Management', 'Quản lý')}
                        </Badge>
                        <Badge variant="secondary">
                          {t('Product', 'Sản phẩm')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="mb-2 text-foreground">
                      {t('Advisory Board', 'Hội đồng cố vấn')}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        'We are actively building our advisory board with education leaders, EdTech investors, and AI experts. Contact us to learn more about advisory opportunities.',
                        'Chúng tôi đang tích cực xây dựng hội đồng cố vấn với các nhà lãnh đạo giáo dục, nhà đầu tư EdTech và chuyên gia AI. Liên hệ với chúng tôi để tìm hiểu thêm về cơ hội cố vấn.'
                      )}
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 9. Investor Invitation */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-12 bg-gradient-to-br from-primary to-secondary text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white" />
                </div>
                <div className="relative z-10">
                  <h2 className="mb-6 text-white">
                    {t('Join us as we build the future of education', 'Tham gia cùng chúng tôi xây dựng tương lai của giáo dục')}
                  </h2>
                  <p className="mb-8 text-white/90 max-w-2xl mx-auto">
                    {t(
                      'We\'re currently seeking early-stage strategic partners to accelerate our pilot rollout and platform expansion. If you share our vision for smart, inclusive education — we\'d love to connect.',
                      'Chúng tôi hiện đang tìm kiếm các đối tác chiến lược giai đoạn đầu để đẩy nhanh việc triển khai thử nghiệm và mở rộng nền tảng. Nếu bạn chia sẻ tầm nhìn của chúng tôi về giáo dục thông minh và toàn diện — chúng tôi rất muốn kết nối.'
                    )}
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <Button size="lg" variant="secondary" className="rounded-xl gap-2">
                      <FileText className="w-5 h-5" />
                      {t('Request Investor Deck', 'Yêu cầu tài liệu đầu tư')}
                    </Button>
                    <Button size="lg" variant="ghost" className="rounded-xl border-2 border-white !text-white hover:bg-white/10 gap-2">
                      <Calendar className="w-5 h-5" />
                      {t('Schedule a Call', 'Lên lịch cuộc gọi')}
                    </Button>
                    <Button size="lg" variant="ghost" className="rounded-xl border-2 border-white !text-white hover:bg-white/10 gap-2">
                      <Globe className="w-5 h-5" />
                      {t('Visit Tuto.education/investors', 'Truy cập Tuto.education/investors')}
                    </Button>
                  </div>

                  <div className="pt-8 border-t border-white/20">
                    <h4 className="mb-4 text-white">
                      {t('Investor Resources', 'Tài nguyên nhà đầu tư')}
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <Download className="w-4 h-4 mr-2" />
                        {t('One-Pager', 'Trang giới thiệu')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {t('Financials', 'Tài chính')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('Whitepaper', 'Bài trắng')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
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
                  'Building the future of connected education',
                  'Xây dựng tương lai của giáo dục kết nối'
                )}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-foreground">
                {t('Contact', 'Liên hệ')}
              </h4>
              <div className="space-y-2">
                <a href="mailto:investor@tutoglobal.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  investor@tutoglobal.com
                </a>
                <a href="https://tutoglobal.com/investors" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="w-4 h-4" />
                  tutoglobal.com/investors
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-foreground">
                {t('Connect', 'Kết nối')}
              </h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Tuto. {t('All rights reserved.', 'Đã đăng ký bản quyền.')}
            </p>
            <p className="text-muted-foreground text-sm">
              {t('Tuto is currently in pre-seed phase. Investor materials available upon request.', 'Tuto hiện đang ở giai đoạn pre-seed. Tài liệu đầu tư có sẵn theo yêu cầu.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
