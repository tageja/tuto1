import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Sparkles } from "lucide-react";

interface ComingSoonScreenProps {
  title: string;
  description: string;
  features?: string[];
}

export function ComingSoonScreen({
  title,
  description,
  features = [],
}: ComingSoonScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
        <div className="flex justify-center mb-4">
          <div className="bg-[#6366F1]/10 p-4 rounded-full">
            <Sparkles className="w-12 h-12 text-[#6366F1]" />
          </div>
        </div>
        <h2 className="text-gray-900 dark:text-white mb-2">
          {t("Coming Soon", "Sắp ra mắt")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t(
            "This feature is currently under development and will be available soon!",
            "Tính năng này đang được phát triển và sẽ sớm ra mắt!"
          )}
        </p>
        <Badge variant="secondary" className="px-4 py-2">
          {t("In Development", "Đang phát triển")}
        </Badge>

        {features.length > 0 && (
          <div className="mt-8 text-left max-w-md mx-auto">
            <h3 className="text-gray-900 dark:text-white mb-4">
              {t("Planned Features:", "Tính năng dự kiến:")}
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
