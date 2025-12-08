import { useLanguage } from "../../LanguageContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Sparkles, Rocket, Bell } from "lucide-react";

interface MobileComingSoonScreenProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
}

export function MobileComingSoonScreen({
  title,
  description,
  icon: Icon = Rocket,
}: MobileComingSoonScreenProps) {
  const { t } = useLanguage();

  const defaultTitle = title || t("Coming Soon", "Sắp ra mắt");
  const defaultDescription =
    description ||
    t(
      "This feature is currently under development. We're working hard to bring it to you soon!",
      "Tính năng này đang được phát triển. Chúng tôi đang nỗ lực để sớm mang đến cho bạn!"
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">{defaultTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("Feature in Development", "Tính năng đang phát triển")}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Icon */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-8 rounded-full mb-6">
          <Icon className="w-16 h-16 text-[#0B5FFF]" />
        </div>

        {/* Coming Soon Badge */}
        <Badge variant="secondary" className="mb-4 gap-1">
          <Sparkles className="w-4 h-4" />
          {t("Coming Soon", "Sắp ra mắt")}
        </Badge>

        {/* Title */}
        <h2 className="text-gray-900 dark:text-white mb-3">
          {t("We're Building Something Great!", "Chúng tôi đang xây dựng điều tuyệt vời!")}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {defaultDescription}
        </p>

        {/* Features List */}
        <div className="w-full max-w-sm bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 mb-6">
          <h4 className="text-gray-900 dark:text-white mb-4">
            {t("What to Expect", "Những gì sẽ có")}
          </h4>
          <div className="space-y-3 text-left">
            {[
              t("Enhanced user experience", "Trải nghiệm người dùng nâng cao"),
              t("Advanced analytics", "Phân tích nâng cao"),
              t("Real-time updates", "Cập nhật thời gian thực"),
              t("Seamless integration", "Tích hợp liền mạch"),
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0" />
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button className="gap-2" size="lg">
          <Bell className="w-5 h-5" />
          {t("Notify Me When Ready", "Thông báo khi sẵn sàng")}
        </Button>

        {/* Timeline */}
        <div className="mt-8 text-gray-500">
          <p>
            {t("Expected Launch:", "Dự kiến ra mắt:")}{" "}
            <span className="text-gray-900 dark:text-white">
              {t("Q1 2026", "Quý 1/2026")}
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#0B5FFF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-gray-900 dark:text-white mb-1">
              {t("Stay Updated", "Luôn cập nhật")}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t(
                "Follow our announcements page for the latest updates on new features and improvements.",
                "Theo dõi trang thông báo để cập nhật mới nhất về tính năng và cải tiến mới."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
