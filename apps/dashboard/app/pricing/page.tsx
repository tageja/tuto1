"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/landing/Footer";
import { useI18n } from "../../contexts/I18nContext";
import {
  Check,
  Sparkles,
  Clock,
  Crown,
  Zap,
  ImageIcon,
  Users,
  Bell,
  HeadphonesIcon,
  Rocket,
  RefreshCw,
  Palette,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Gift,
  Star,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

interface Feature {
  icon: React.ElementType;
  text: string;
  textVi: string;
}

const premiumFeatures: Feature[] = [
  { icon: Sparkles, text: "AI-First Platform", textVi: "Nền tảng AI tiên tiến" },
  { icon: ImageIcon, text: "Unlimited Photo Uploads", textVi: "Tải ảnh không giới hạn" },
  { icon: Users, text: "Unlimited Students", textVi: "Học sinh không giới hạn" },
  { icon: Bell, text: "Unlimited Notifications", textVi: "Thông báo không giới hạn" },
  { icon: HeadphonesIcon, text: "Priority Support", textVi: "Hỗ trợ ưu tiên" },
  { icon: Rocket, text: "Early Access to New Features", textVi: "Truy cập sớm tính năng mới" },
  { icon: RefreshCw, text: "Unlimited Updates", textVi: "Cập nhật không giới hạn" },
  { icon: Palette, text: "Color Theme Customization", textVi: "Tùy chỉnh giao diện màu sắc" },
  { icon: MessageCircle, text: "Chat (Parents & Team)", textVi: "Nhắn tin (Phụ huynh & Nhóm)" },
  { icon: BarChart3, text: "Full KPIs & Analytics Charts", textVi: "Đầy đủ KPI & Biểu đồ phân tích" },
  { icon: Zap, text: "Unlimited Push Notifications", textVi: "Thông báo đẩy không giới hạn" },
];

export default function PricingPage() {
  const { t, lang } = useI18n();
  const isVi = lang === "vi";

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-white to-blue-50/30">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center mb-16"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
            <Gift className="w-4 h-4" />
            {isVi ? "Ưu đãi đặc biệt cho trường mới" : "Special Offer for New Schools"}
          </motion.div>
          
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            {isVi ? "Bảng Giá Trường Học" : "School Pricing"}
          </motion.h1>
          <motion.p variants={item} className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isVi
              ? "Chọn gói phù hợp với nhu cầu của trường bạn"
              : "Choose the plan that fits your school's needs"}
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Free Tier */}
          <motion.div
            variants={item}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg shadow-gray-100/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -translate-y-16 translate-x-16" />
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Free</h3>
              
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                  <span className="text-xl font-bold text-gray-400">
                    {isVi ? "Sắp ra mắt" : "Coming Soon"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{isVi ? "Tính năng cơ bản" : "Basic features"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{isVi ? "Giới hạn học sinh" : "Limited students"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{isVi ? "Hỗ trợ email" : "Email support"}</span>
                </div>
              </div>

              <button
                disabled
                className="mt-8 w-full py-3.5 px-6 rounded-xl font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
              >
                {isVi ? "Sắp ra mắt" : "Coming Soon"}
              </button>
            </div>
          </motion.div>

          {/* Plus Tier */}
          <motion.div
            variants={item}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg shadow-gray-100/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16" />
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Plus</h3>
              
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <span className="text-xl font-bold text-blue-400">
                    {isVi ? "Sắp ra mắt" : "Coming Soon"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>{isVi ? "Tất cả tính năng Free" : "All Free features"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>{isVi ? "Phân tích nâng cao" : "Advanced analytics"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>{isVi ? "Nhiều học sinh hơn" : "More students"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>{isVi ? "Hỗ trợ ưu tiên" : "Priority support"}</span>
                </div>
              </div>

              <button
                disabled
                className="mt-8 w-full py-3.5 px-6 rounded-xl font-semibold text-blue-400 bg-blue-50 border border-blue-200 cursor-not-allowed"
              >
                {isVi ? "Sắp ra mắt" : "Coming Soon"}
              </button>
            </div>
          </motion.div>

          {/* Premium Tier - Featured */}
          <motion.div
            variants={item}
            className="bg-gradient-to-br from-primary via-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl shadow-primary/30 relative overflow-hidden ring-4 ring-primary/20"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
            
            {/* Popular badge */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {isVi ? "Phổ biến nhất" : "Most Popular"}
              </div>
            </div>
            
            <div className="relative text-white">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-amber-300" />
                <h3 className="text-2xl font-bold">Premium</h3>
              </div>
              <p className="text-blue-100 mb-6">{isVi ? "Đầy đủ tính năng" : "Full features"}</p>
              
              {/* Pricing */}
              <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-blue-200 line-through">/ {isVi ? "tháng" : "month"}</span>
                </div>
                <div className="text-blue-100 text-sm mb-3">
                  ≈ 570,000₫ / {isVi ? "tháng" : "month"}
                </div>
                
                {/* Free promotion banner */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-white font-bold">
                    <Gift className="w-5 h-5" />
                    {isVi ? "MIỄN PHÍ 6 THÁNG" : "FREE FOR 6 MONTHS"}
                  </div>
                  <div className="text-white/90 text-xs mt-1">
                    {isVi ? "Đến 13/07/2026 cho trường mới" : "Until July 13, 2026 for new schools"}
                  </div>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm text-blue-50">{isVi ? feature.textVi : feature.text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/school"
                className="block w-full py-4 px-6 rounded-xl font-bold text-primary bg-white hover:bg-blue-50 transition-all shadow-lg text-center group"
              >
                <span className="flex items-center justify-center gap-2">
                  {isVi ? "Bắt đầu miễn phí" : "Start Free Now"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-primary/5 to-indigo-50 rounded-2xl p-6 border border-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900">
                {isVi ? "Bắt đầu ngay hôm nay!" : "Get started today!"}
              </h4>
              <p className="text-gray-600 text-sm">
                {isVi
                  ? "Đăng ký để nhận 6 tháng Premium miễn phí cho trường của bạn"
                  : "Sign up to get 6 months of Premium free for your school"}
              </p>
            </div>
            <Link
              href="/school"
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-md whitespace-nowrap"
            >
              {isVi ? "Đăng ký ngay" : "Sign Up Now"}
            </Link>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-20 text-center"
        >
          <motion.h3 variants={item} className="text-2xl font-bold text-gray-900 mb-8">
            {isVi ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
          </motion.h3>
          
          <motion.div variants={item} className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-left shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                {isVi ? "Tại sao Premium miễn phí 6 tháng?" : "Why is Premium free for 6 months?"}
              </h4>
              <p className="text-gray-600 text-sm">
                {isVi
                  ? "Chúng tôi muốn các trường có thời gian trải nghiệm đầy đủ tính năng và thấy được giá trị thực sự của Tuto trước khi cam kết lâu dài."
                  : "We want schools to have time to experience all features and see the real value of Tuto before making a long-term commitment."}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-left shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                {isVi ? "Sau 6 tháng thì sao?" : "What happens after 6 months?"}
              </h4>
              <p className="text-gray-600 text-sm">
                {isVi
                  ? "Bạn có thể tiếp tục với gói Premium với giá $12/tháng (≈570,000₫) hoặc chọn gói phù hợp khác khi chúng tôi ra mắt."
                  : "You can continue with Premium at $12/month (≈570,000₫) or choose another plan when we launch them."}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-left shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                {isVi ? "Có hỗ trợ thiết lập không?" : "Is there setup support?"}
              </h4>
              <p className="text-gray-600 text-sm">
                {isVi
                  ? "Có! Chúng tôi cung cấp hỗ trợ cá nhân để giúp bạn thiết lập và đào tạo nhân viên sử dụng hệ thống."
                  : "Yes! We provide personalized support to help you set up and train your staff on the system."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}